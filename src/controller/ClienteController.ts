// Importa a classe Cliente do model — é daqui que vêm os métodos de acesso ao banco de dados
import Cliente from "../model/Cliente.js";

// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";

// Importa o tipo ClienteDTO para tipar os dados recebidos do front-end no body das requisições
import type { ClienteDTO } from "../interface/ClienteDTO.js";

// Define a classe ClienteController que HERDA da classe Cliente (extends)
// A herança permite que o controller acesse os métodos estáticos do model sem precisar importá-los separadamente
class ClienteController extends Cliente {

    /**
     * Lista todos os clientes ativos cadastrados no sistema.
     * Retorna 204 se não houver clientes cadastrados, 200 com a lista caso contrário.
     *
     * @param req Objeto de requisição HTTP (não utiliza parâmetros neste método).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com array de ClienteDTO | 204 sem conteúdo | 500 em caso de erro interno.
     */
    static async todos(req: Request, res: Response) {
        try {
            const listaDeClientes = await Cliente.listarClientes();

            if (listaDeClientes.length === 0) {
                res.status(204).send();
                return;
            }

            res.status(200).json(listaDeClientes);

        } catch (error) {
            console.error(`[ClienteController] Erro ao listar clientes:`, error);
            res.status(500).json({ mensagem: "Erro interno ao recuperar a lista de clientes." });
        }
    }

    /**
     * Busca e retorna os dados de um cliente específico pelo ID informado na URL.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "id" na URL (ex: /api/cliente/3).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com ClienteDTO | 400 se o ID for inválido | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async cliente(req: Request, res: Response) {
        try {
            const idCliente = parseInt(req.params.id as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
                return;
            }

            const cliente = await Cliente.listarCliente(idCliente);

            res.status(200).json(cliente);

        } catch (error: any) {
            console.error(`[ClienteController] Erro ao buscar cliente (id: ${req.params.id}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({ mensagem: "Erro interno ao recuperar o cliente." });
        }
    }

    /**
     * Cadastra um novo cliente no sistema com os dados recebidos no corpo da requisição.
     * Valida campos obrigatórios antes de persistir no banco de dados.
     *
     * @param req Objeto de requisição HTTP. Espera no body: nome, endereco, email, telefone, cpf (obrigatórios).
     * @param res Objeto de resposta HTTP.
     * @returns 201 se cadastrado com sucesso | 400 se campos obrigatórios ausentes ou falha no cadastro | 500 em caso de erro interno.
     */
    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: ClienteDTO = req.body;

            if (!dadosRecebidos.nome || !dadosRecebidos.endereco
                || dadosRecebidos.telefone === undefined || dadosRecebidos.cpf === undefined) {
                res.status(400).json({ mensagem: "Campos obrigatórios ausentes: nome, endereco, telefone e cpf." });
                return;
            }

            const novoCliente = new Cliente(
                dadosRecebidos.nome,
                dadosRecebidos.endereco,
                dadosRecebidos.telefone,
                dadosRecebidos.cpf,
                dadosRecebidos.email
            );

            const result = await Cliente.cadastrarCliente(novoCliente as unknown as ClienteDTO);

            if (result) {
                res.status(201).json({ mensagem: "Cliente cadastrado com sucesso." });
            } else {
                res.status(400).json({ mensagem: "Não foi possível cadastrar o cliente." });
            }

        } catch (error) {
            console.error(`[ClienteController] Erro ao cadastrar cliente:`, error);
            res.status(500).json({ mensagem: "Erro interno ao cadastrar o cliente." });
        }
    }

    /**
     * Remove logicamente um cliente do sistema pelo ID informado na URL.
     * O registro não é apagado do banco — apenas desativado (status_cliente = FALSE).
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "id" na URL (ex: /api/cliente/3).
     * @param res Objeto de resposta HTTP.
     * @returns 200 se removido com sucesso | 400 se o ID for inválido | 404 se não encontrado ou já inativo | 500 em caso de erro interno.
     */
    static async remover(req: Request, res: Response) {
        try {
            const idCliente = parseInt(req.params.id as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
                return;
            }

            const result = await Cliente.removerCliente(idCliente);

            if (result) {
                res.status(200).json({ mensagem: "Cliente removido com sucesso." });
            } else {
                res.status(404).json({ mensagem: "Cliente não encontrado ou já está inativo." });
            }

        } catch (error: any) {
            console.error(`[ClienteController] Erro ao remover cliente (id: ${req.params.id}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({ mensagem: "Erro interno ao remover o cliente." });
        }
    }

    /**
     * Atualiza os dados cadastrais de um cliente existente no sistema.
     * Valida o ID na URL e os campos obrigatórios no body antes de persistir no banco.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "id" na URL e no body: nome,
     *            endereco, email, telefone e cpf (obrigatórios).
     * @param res Objeto de resposta HTTP.
     * @returns 200 se atualizado com sucesso | 400 se o ID ou campos forem inválidos | 404 se não encontrado ou inativo | 500 em caso de erro interno.
     */
    static async atualizar(req: Request, res: Response) {
        try {
            const idCliente = parseInt(req.params.id as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
                return;
            }

            const dadosRecebidos: ClienteDTO = req.body;

            if (!dadosRecebidos.nome || !dadosRecebidos.endereco
                || dadosRecebidos.telefone === undefined || dadosRecebidos.cpf === undefined) {
                res.status(400).json({ mensagem: "Campos obrigatórios ausentes: nome, endereco, telefone e cpf." });
                return;
            }

            const cliente: ClienteDTO = {
                idCliente: idCliente,
                nome: dadosRecebidos.nome,
                endereco: dadosRecebidos.endereco,
                telefone: dadosRecebidos.telefone,
                cpf: dadosRecebidos.cpf,
                ...(dadosRecebidos.email !== undefined ? { email: dadosRecebidos.email } : {})
            };

            const result = await Cliente.atualizarCliente(cliente);

            if (result) {
                res.status(200).json({ mensagem: "Cadastro atualizado com sucesso." });
            } else {
                res.status(404).json({ mensagem: "Cliente não encontrado ou já está inativo." });
            }

        } catch (error: any) {
            console.error(`[ClienteController] Erro ao atualizar cliente (id: ${req.params.id}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({ mensagem: "Erro interno ao atualizar o cliente." });
        }
    }
    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidosCliente = req.body;
            const respostaModelo = await Cliente.cadastrarCliente(dadosRecebidosCliente);

            if (respostaModelo) {
                return res.status(201).json({ mensagem: "Cliente cadastrado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Erro ao cadastrar cliente." });
            }
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível inserir o cliente." });
        }
    }
    static async id(req: Request, res: Response): Promise<Response> {
        try {
            const idCliente: number = parseInt(req.params.idCliente as string);
            const respostaModel = await Cliente.listarCliente(idCliente);
            return res.status(200).json(respostaModel);
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível obter informações do cliente." });
        }
}
}
// Exporta a classe para que possa ser importada e usada no arquivo de rotas (routes.ts)
export default ClienteController;