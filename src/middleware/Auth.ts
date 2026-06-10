// imports
import jwt from 'jsonwebtoken';
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
    exp: number;
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
        const querySelectUser = `SELECT id_usuario, nome, email, senha FROM usuarios WHERE email=$1 AND senha=$2;`;

        try {
            // faz a requisição ao banco de dados
            const queryResult = await database.query(querySelectUser, [email, senha]);

            // verifica se a quantidade de linhas retornada foi diferente de 0
            // se foi, quer dizer que o email e senha fornecidos são iguais aos do banco de dados
            if (queryResult.rowCount != 0) {
                // cria um objeto chamado professor com o id, nome e email. Essas informações serão devolvidas ao cliente
                const usuario = {
                    id_usuario: queryResult.rows[0].id_usuario,
                    nome: queryResult.rows[0].nome,
                    email: queryResult.rows[0].email,
                    senha: queryResult.rows[0].senha
                }

                // Gera o token do usuário, passando como parâmetro as informações do objeto professor
                const tokenUsuario = Auth.generateToken(parseInt(usuario.id_usuario), usuario.nome, usuario.email, usuario.senha);

                // retorna ao cliente o status de autenticação (verdadeiro), o token e o objeto professor
                // tudo isso encapsulado em um JSON
                return res.status(200).json({ auth: true, token: tokenUsuario, usuario: usuario });
            } else {
                // caso a autenticação não tenha sido bem sucedida, é retornado ao cliente o statu de autenticação (falso), um token nulo e a mensagem de falha
                return res.status(401).json({ auth: false, token: null, message: "Usuário e/ou senha incorretos" });
            }
            // verifica possíveis erros durante a requisição
        } catch (error) {
            console.log(`Erro no modelo: ${error}`);
            return res.status(500).json({ message: "Erro interno do servidor" });
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
    static generateToken(id: number, nome: string, email: string, senha: string) {
        // retora o token gerado
        // id: ID do professor no banco de dados
        // nome: nome do professor no banco de dados
        // email: email do professor no banco de dados
        // SECRET: palavra secreta
        // expiresIn: tempo até a expiração do token (neste exemplo, 1 hora)
        return jwt.sign({ id, nome, email, senha }, SECRET, { expiresIn: '1h' });
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

            // desestrutura o objeto JwtPayload e armazena as informações exp e id em variáveis
            const { exp, id } = decoded as JwtPayload;

            // verifica se existe data de expiração ou o id no token que foi recebido pelo cliente
            if (!exp || !id) {
                console.log('Data de expiração ou ID não encontrada no token');
                return res.status(401).json({ message: "Token inválido, faça o login", auth: false }).end();
            }

            // verifica se o tempo de validade do token foi expirado
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime > exp) {
                console.log('Token expirado');
                return res.status(401).json({ message: "Token expirado, faça o login novamente", auth: false }).end();
            }

            req.headers['userId'] = String(id);
            next();
        });
    }
}