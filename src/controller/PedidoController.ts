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

    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const {
                idCliente,
                idProduto,
                dataPedido,
                valorTotal,
                statusPedido
            } = req.body;

            // Validação do id do cliente
            if (
                idCliente === undefined ||
                idCliente === null ||
                typeof idCliente !== "number"
            ) {
                return res.status(400).json({
                    mensagem: "O id do cliente é obrigatório e deve ser um número."
                });
            }

            // Validação do id do produto
            if (
                idProduto === undefined ||
                idProduto === null ||
                typeof idProduto !== "number"
            ) {
                return res.status(400).json({
                    mensagem: "O id do produto é obrigatório e deve ser um número."
                });
            }

            // Validação da data do pedido
            if (
                !dataPedido ||
                typeof dataPedido !== "string" ||
                dataPedido.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "A data do pedido é obrigatória."
                });
            }

            // Validação do valor total
            if (
                valorTotal === undefined ||
                valorTotal === null ||
                typeof valorTotal !== "number"
            ) {
                return res.status(400).json({
                    mensagem: "O valor total é obrigatório e deve ser um número."
                });
            }

            // Valor total não pode ser negativo
            if (valorTotal < 0) {
                return res.status(400).json({
                    mensagem: "O valor total não pode ser negativo."
                });
            }

            // Validação do status
            if (
                !statusPedido ||
                typeof statusPedido !== "string" ||
                statusPedido.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O status do pedido é obrigatório."
                });
            }

            const dadosRecebidosPedido = {
                idCliente,
                idProduto,
                dataPedido: new Date(dataPedido),
                valorTotal,
                statusPedido: statusPedido.trim()
            };

            console.log("Dados recebidos do pedido:", dadosRecebidosPedido);

            const respostaModelo =
                await Pedido.cadastrarPedido(dadosRecebidosPedido);

            if (respostaModelo) {
                return res.status(201).json({
                    mensagem: "Pedido cadastrado com sucesso."
                });
            }

            return res.status(400).json({
                mensagem: "Erro ao cadastrar pedido."
            });

        } catch (error) {
            console.error(`Erro no modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível inserir o pedido."
            });
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

    static async detalhados(req: Request, res: Response): Promise<Response> {
        try {
            const pedidos = await Pedido.listarPedidosDetalhados();

            return res.status(200).json(pedidos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                mensagem: "Erro ao listar pedidos detalhados."
            });
        }
    }
}

export default PedidoController;