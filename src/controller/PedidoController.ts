// Importa a classe Pedido do model — é daqui que vêm os métodos de acesso ao banco de dados
import Pedido from "../model/Pedido.js";

// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";

// Importa o tipo PedidoDTO para tipar os dados recebidos do front-end no body das requisições
import type { PedidoDTO } from "../interface/PedidoDTO.js";

// Define a classe PedidoController que HERDA da classe Pedido (extends)
class PedidoController extends Pedido {

    /**
     * Lista todos os pedidos cadastrados no sistema.
     * Retorna 204 se não houver pedidos cadastrados, 200 com a lista caso contrário.
     *
     * @param req Objeto de requisição HTTP (não utiliza parâmetros neste método).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com array de PedidoDTO | 204 sem conteúdo | 500 em caso de erro interno.
     */
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaPedido = await Pedido.listarPedidos();

            if (listaPedido.length === 0) {
                return res.status(204).send();
            }

            return res.status(200).json(listaPedido);

        } catch (error) {
            console.error(`[PedidoController] Erro ao listar pedidos:`, error);
            return res.status(500).json({ mensagem: "Não foi possível acessar a lista de pedidos." });
        }
    }

    /**
     * Cadastra um novo pedido no sistema com os dados recebidos no corpo da requisição.
     * Valida campos obrigatórios antes de persistir no banco de dados.
     *
     * @param req Objeto de requisição HTTP. Espera no body: idCliente, idProduto, dataPedido,
     *            valorTotal e statusPedido (obrigatórios).
     * @param res Objeto de resposta HTTP.
     * @returns 201 se cadastrado com sucesso | 400 se campos obrigatórios ausentes ou falha no cadastro | 500 em caso de erro interno.
     */
    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: PedidoDTO = req.body;

            if (dadosRecebidos.idCliente === undefined || dadosRecebidos.idProduto === undefined
                || !dadosRecebidos.dataPedido || dadosRecebidos.valorTotal === undefined
                || !dadosRecebidos.statusPedido) {
                return res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: idCliente, idProduto, dataPedido, valorTotal e statusPedido."
                });
            }

            const result = await Pedido.cadastrarPedido(dadosRecebidos);

            if (result) {
                return res.status(201).json({ mensagem: "Pedido cadastrado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Não foi possível cadastrar o pedido." });
            }

        } catch (error) {
            console.error(`[PedidoController] Erro ao cadastrar pedido:`, error);
            return res.status(500).json({ mensagem: "Não foi possível inserir o pedido." });
        }
    }

    /**
     * Busca e retorna os dados de um pedido específico pelo ID informado na URL.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "idPedido" na URL (ex: /api/pedido/3).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com PedidoDTO | 400 se o ID for inválido | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async id(req: Request, res: Response): Promise<Response> {
        try {
            const idPedido = parseInt(req.params.idPedido as string);

            if (isNaN(idPedido) || idPedido <= 0) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
            }

            const pedido = await Pedido.listarPedido(idPedido);

            return res.status(200).json(pedido);

        } catch (error: any) {
            console.error(`[PedidoController] Erro ao buscar pedido (id: ${req.params.idPedido}):`, error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({ mensagem: error.message });
            }

            return res.status(500).json({ mensagem: "Não foi possível obter informações do pedido." });
        }
    }

    /**
     * Atualiza os dados de um pedido existente no sistema.
     * Valida o ID na URL e os campos obrigatórios no body antes de persistir no banco.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "idPedido" na URL e no body:
     *            idCliente, idProduto, dataPedido, valorTotal e statusPedido (obrigatórios).
     * @param res Objeto de resposta HTTP.
     * @returns 200 se atualizado com sucesso | 400 se o ID ou campos forem inválidos | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idPedido = parseInt(req.params.idPedido as string);

            if (isNaN(idPedido) || idPedido <= 0) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
            }

            const dadosRecebidos: PedidoDTO = req.body;

            if (dadosRecebidos.idCliente === undefined || dadosRecebidos.idProduto === undefined
                || !dadosRecebidos.dataPedido || dadosRecebidos.valorTotal === undefined
                || !dadosRecebidos.statusPedido) {
                return res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: idCliente, idProduto, dataPedido, valorTotal e statusPedido."
                });
            }

            const pedido: PedidoDTO = {
                idPedido: idPedido,
                idCliente: dadosRecebidos.idCliente,
                idProduto: dadosRecebidos.idProduto,
                dataPedido: dadosRecebidos.dataPedido,
                valorTotal: dadosRecebidos.valorTotal,
                statusPedido: dadosRecebidos.statusPedido
            };

            const result = await Pedido.atualizarPedido(pedido);

            if (result) {
                return res.status(200).json({ mensagem: "Pedido atualizado com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Pedido não encontrado." });
            }

        } catch (error: any) {
            console.error(`[PedidoController] Erro ao atualizar pedido (id: ${req.params.idPedido}):`, error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({ mensagem: error.message });
            }

            return res.status(500).json({ mensagem: "Não foi possível atualizar o pedido." });
        }
    }

    /**
     * Remove um pedido do sistema pelo ID informado na URL.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "idPedido" na URL (ex: /api/pedido/3).
     * @param res Objeto de resposta HTTP.
     * @returns 200 se removido com sucesso | 400 se o ID for inválido | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idPedido = parseInt(req.params.idPedido as string);

            if (isNaN(idPedido) || idPedido <= 0) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
            }

            const result = await Pedido.removerPedido(idPedido);

            if (result) {
                return res.status(200).json({ mensagem: "Pedido removido com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Pedido não encontrado." });
            }

        } catch (error: any) {
            console.error(`[PedidoController] Erro ao remover pedido (id: ${req.params.idPedido}):`, error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({ mensagem: error.message });
            }

            return res.status(500).json({ mensagem: "Não foi possível remover o pedido." });
        }
    }

    /**
     * Lista pedidos com estoque baixo usando a view vw_pedidos_completos_baixo.
     *
     * @param req Objeto de requisição HTTP (não utiliza parâmetros neste método).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com a lista de pedidos | 500 em caso de erro interno.
     */
    static async listarPedidoBaixo(req: Request, res: Response): Promise<Response> {
        try {
            const resultado = await Pedido.listarPedidosBaixo();
            return res.status(200).json(resultado);
        } catch (error) {
            console.error(`[PedidoController] Erro ao listar pedidos baixos:`, error);
            return res.status(500).json({ mensagem: "Erro ao buscar pedidos baixos." });
        }
    }

    /**
     * Lista todos os pedidos com informações completas usando a view vw_pedidos_completos.
     *
     * @param req Objeto de requisição HTTP (não utiliza parâmetros neste método).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com a lista de pedidos | 500 em caso de erro interno.
     */
    static async listarPedidoCompleto(req: Request, res: Response): Promise<Response> {
        try {
            const resultado = await Pedido.listarPedidosCompleto();
            return res.status(200).json(resultado);
        } catch (error) {
            console.error(`[PedidoController] Erro ao listar pedidos completos:`, error);
            return res.status(500).json({ mensagem: "Erro ao buscar pedidos completos." });
        }
    }
}

export default PedidoController;