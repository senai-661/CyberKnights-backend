// imports
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { type Request, type Response, type NextFunction } from 'express';
import { DatabaseModel } from '../model/DatabaseModel.js';

export function Authreq(req: Request, res: Response, next: NextFunction) {
  console.log("HEADERS:", req.headers);
  console.log("AUTH:", req.headers.authorization);

  next();
}

// palavra secreta
const SECRET = 'lanches-maga';
// pool de conexão ao banco de dados
const database = new DatabaseModel().pool;

/**
 * Interface para representar um Payload do JWT
 * (Não obrigatório, mas recomendado)
 */
interface JwtPayload {
    id: number;
    nome: string;
    email: string;
    role: string;
}

/**
 * Gera e trata um token de autenticação para o sistema
 */
export class Auth {

    /**
     * Valida as credenciais do usuário no banco de dados
     * @param req Requisição com as informações do usuário
     * @param res Resposta enviada a quem requisitou o login
     * @returns Token de autenticação caso o usuário seja válido, mensagem de login não autorizado caso negativo
     */
    static async validacaoUsuario(req: Request, res: Response): Promise<any> {
        // recupera informações do corpo da requisição
        const { email, senha } = req.body;

        // query para validar email e senha informados pelo cliente
        const querySelectUser = `SELECT id_usuario, nome, email, role FROM usuario WHERE email=$1 AND senha=$2;`;

        try {
               const debugFile = path.join(process.cwd(), 'infra', 'sql', 'login-debug.log');
               const debugMsg = `[${new Date().toISOString()}] LOGIN ATTEMPT - email=${email}\n`;
               try { fs.appendFileSync(debugFile, debugMsg); } catch (e) { console.error('Falha ao escrever debug file:', e); }
               console.log('=== TENTATIVA DE LOGIN ===');
               console.log('Email recebido:', email);
               console.log('Senha recebida:', senha);
               console.log('Executando query no banco de dados...');
            // faz a requisição ao banco de dados
            const queryResult = await database.query(querySelectUser, [email, senha]);

               console.log('Resultado da query - rowCount:', queryResult.rowCount);
            // verifica se a quantidade de linhas retornada foi diferente de 0
            // se foi, quer dizer que o email e senha fornecidos são iguais aos do banco de dados
            if (queryResult.rowCount != 0) {
                   console.log('Login bem-sucedido!');
                // cria um objeto chamado usuario com o id, nome, email e role. Essas informações serão devolvidas ao cliente
                const usuario = {
                    id_usuario: queryResult.rows[0].id_usuario,
                    nome: queryResult.rows[0].nome,
                    email: queryResult.rows[0].email,
                    role: queryResult.rows[0].role
                }

                // Gera o token do usuário, passando como parâmetro as informações do objeto usuario
                const tokenUsuario = Auth.generateToken(parseInt(usuario.id_usuario), usuario.nome, usuario.email, usuario.role);

                // retorna ao cliente o status de autenticação (verdadeiro), o token e o objeto professor
                // tudo isso encapsulado em um JSON
                return res.status(200).json({ auth: true, token: tokenUsuario, usuario: usuario });
            } else {
                   console.log('Email/Senha incorretos');
                // caso a autenticação não tenha sido bem sucedida, é retornado ao cliente o statu de autenticação (falso), um token nulo e a mensagem de falha
                return res.status(401).json({ auth: false, token: null, message: "Usuário e/ou senha incorretos" });
            }
            // verifica possíveis erros durante a requisição
        } catch (error) {
           console.error(`❌ ERRO NO LOGIN: ${error}`);
           console.error(error);
           const debugFile = path.join(process.cwd(), 'infra', 'sql', 'login-debug.log');
           const stack = (error as any)?.stack ?? String(error);
           try { fs.appendFileSync(debugFile, `[${new Date().toISOString()}] ERRO: ${stack}\n`); } catch (e) { console.error('Falha ao escrever debug file:', e); }
            return res.status(500).json({ message: "Erro interno do servidor", error: stack });
        }
    }

    /**
     * Gera token de validação do usuário
     * 
     * @param id ID do usuário no banco de dados
     * @param nome Nome do usuário no banco de dados
     * @param email Email do usuário no banco de dados
     * @returns Token de autenticação do usuário
     */
    static generateToken(id: number, nome: string, email: string, role: string) {
        // retora o token gerado
        // id: ID do usuário no banco de dados
        // nome: nome do usuário no banco de dados
        // email: email do usuário no banco de dados
        // role: permissão/cargo do usuário
        // SECRET: palavra secreta
        // expiresIn: tempo até a expiração do token (neste exemplo, 1 hora)
        return jwt.sign({ id, nome, email, role }, SECRET, { expiresIn: '1h' });
    }

    /**
     * Verifica o token do usuário para saber se ele é válido
     * 
     * @param req Requisição
     * @param res Resposta
     * @param next Próximo middleware
     * @returns Token validado ou erro
     */
    static verifyToken(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['x-access-token'] as string;

        if (!token) {
            console.log('Token não informado');
            return res.status(401).json({ message: "Token não informado", auth: false }).end();
        }

        jwt.verify(token, SECRET, (err, decoded) => {
            // verifica se ocorreu algum erro na validação do token
            if (err) {
                // verifica se o token já expirou
                if (err.name === 'TokenExpiredError') {
                    console.log('Token expirado');
                    return res.status(401).json({ message: "Token expirado, faça o login novamente", auth: false }).end();
                } else {
                    console.log('Token inválido.');
                    return res.status(401).json({ message: "Token inválido, faça o login", auth: false }).end();
                }
            }

            // garante que o decoded não é undefined antes de continuar
            if (!decoded) {
                console.log('Token não pôde ser decodificado');
                return res.status(401).json({ message: "Token inválido, faça o login", auth: false }).end();
            }

            // desestrutura o objeto JwtPayload e armazena as informações de id, nome, email e role
            const { id, nome, email, role } = decoded as JwtPayload;

            // verifica se existe id no token que foi recebido pelo cliente
            if (!id) {
                console.log('ID não encontrado no token');
                return res.status(401).json({ message: "Token inválido, faça o login", auth: false }).end();
            }

            req.headers['userId'] = String(id);
            next();
        });
    }
}