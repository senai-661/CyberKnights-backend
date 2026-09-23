// Importa a classe Produto do model — é daqui que vêm os métodos de acesso ao banco de dados
import Produto from "../model/Produto.js";

// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";

// Importa o tipo ProdutoDTO para tipar os dados recebidos do front-end no body das requisições
import type { ProdutoDTO } from "../interface/ProdutoDTO.js";

// Define a classe ProdutoController que HERDA da classe Produto (extends)
class ProdutoController extends Produto {

    /**
     * Lista todos os produtos cadastrados no sistema.
     * Retorna 204 se não houver produtos cadastrados, 200 com a lista caso contrário.
     *
     * @param req Objeto de requisição HTTP (não utiliza parâmetros neste método).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com array de ProdutoDTO | 204 sem conteúdo | 500 em caso de erro interno.
     */
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaProduto = await Produto.listarProdutos();

            if (listaProduto.length === 0) {
                return res.status(204).send();
            }

            return res.status(200).json(listaProduto);

        } catch (error) {
            console.error(`[ProdutoController] Erro ao listar produtos:`, error);
            return res.status(500).json({ mensagem: "Não foi possível acessar a lista de produtos." });
        }
    }

    /**
     * Busca e retorna os dados de um produto específico pelo ID informado na URL.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "idProduto" na URL (ex: /api/produto/3).
     * @param res Objeto de resposta HTTP.
     * @returns 200 com ProdutoDTO | 400 se o ID for inválido | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async id(req: Request, res: Response): Promise<Response> {
        try {
            const idProduto = parseInt(req.params.idProduto as string);

            if (isNaN(idProduto) || idProduto <= 0) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
            }

            const produto = await Produto.listarProduto(idProduto);

            return res.status(200).json(produto);

        } catch (error: any) {
            console.error(`[ProdutoController] Erro ao buscar produto (id: ${req.params.idProduto}):`, error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({ mensagem: error.message });
            }

            return res.status(500).json({ mensagem: "Não foi possível obter informações do produto." });
        }
    }

    /**
     * Cadastra um novo produto no sistema com os dados recebidos no corpo da requisição.
     * Valida campos obrigatórios antes de persistir no banco de dados.
     *
     * @param req Objeto de requisição HTTP. Espera no body: nomeProduto, preco e disponibilidade (obrigatórios).
     * @param res Objeto de resposta HTTP.
     * @returns 201 se cadastrado com sucesso | 400 se campos obrigatórios ausentes ou falha no cadastro | 500 em caso de erro interno.
     */
    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: ProdutoDTO = req.body;

            if (!dadosRecebidos.nomeProduto || dadosRecebidos.preco === undefined || !dadosRecebidos.disponibilidade) {
                return res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: nomeProduto, preco e disponibilidade."
                });
            }

            const result = await Produto.cadastrarProduto(dadosRecebidos);

            if (result) {
                return res.status(201).json({ mensagem: "Produto cadastrado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Não foi possível cadastrar o produto." });
            }

        } catch (error) {
            console.error(`[ProdutoController] Erro ao cadastrar produto:`, error);
            return res.status(500).json({ mensagem: "Não foi possível inserir o produto." });
        }
    }

    /**
     * Atualiza os dados de um produto existente no sistema.
     * Valida o ID na URL e os campos obrigatórios no body antes de persistir no banco.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "idProduto" na URL e no body:
     *            nomeProduto, preco e disponibilidade (obrigatórios).
     * @param res Objeto de resposta HTTP.
     * @returns 200 se atualizado com sucesso | 400 se o ID ou campos forem inválidos | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idProduto = parseInt(req.params.idProduto as string);

            if (isNaN(idProduto) || idProduto <= 0) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
            }

            const dadosRecebidos: ProdutoDTO = req.body;

            if (!dadosRecebidos.nomeProduto || dadosRecebidos.preco === undefined || !dadosRecebidos.disponibilidade) {
                return res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: nomeProduto, preco e disponibilidade."
                });
            }

            const produto: ProdutoDTO = {
                idProduto: idProduto,
                nomeProduto: dadosRecebidos.nomeProduto,
                preco: dadosRecebidos.preco,
                disponibilidade: dadosRecebidos.disponibilidade
            };

            const result = await Produto.atualizarProduto(produto);

            if (result) {
                return res.status(200).json({ mensagem: "Produto atualizado com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Produto não encontrado." });
            }

        } catch (error: any) {
            console.error(`[ProdutoController] Erro ao atualizar produto (id: ${req.params.idProduto}):`, error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({ mensagem: error.message });
            }

            return res.status(500).json({ mensagem: "Não foi possível atualizar o produto." });
        }
    }

    /**
     * Remove um produto do sistema pelo ID informado na URL.
     *
     * @param req Objeto de requisição HTTP. Espera o parâmetro "idProduto" na URL (ex: /api/produto/3).
     * @param res Objeto de resposta HTTP.
     * @returns 200 se removido com sucesso | 400 se o ID for inválido | 404 se não encontrado | 500 em caso de erro interno.
     */
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idProduto = parseInt(req.params.idProduto as string);

            if (isNaN(idProduto) || idProduto <= 0) {
                return res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro positivo." });
            }

            const result = await Produto.removerProduto(idProduto);

            if (result) {
                return res.status(200).json({ mensagem: "Produto removido com sucesso." });
            } else {
                return res.status(404).json({ mensagem: "Produto não encontrado." });
            }

        } catch (error: any) {
            console.error(`[ProdutoController] Erro ao remover produto (id: ${req.params.idProduto}):`, error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({ mensagem: error.message });
            }

            return res.status(500).json({ mensagem: "Não foi possível remover o produto." });
        }
    }
}

export default ProdutoController;