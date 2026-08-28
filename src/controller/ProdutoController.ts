import Produto from "../model/Produto.js";
import type { Request, Response } from "express";

class ProdutoController extends Produto {

    static async todos(req: Request, res: Response): Promise<Response> {
        try {

            const listaProduto: Array<Produto> | null =
                await Produto.listarProduto();

            return res.status(200).json(listaProduto);

        } catch (error) {

            console.error(`Erro ao consultar modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível acessar a lista de produtos."
            });
        }
    }

    static async novo(req: Request, res: Response): Promise<Response> {
        try {

            const {
                nomeProduto,
                preco,
                disponibilidade
            } = req.body;

            if (
                !nomeProduto ||
                typeof nomeProduto !== "string" ||
                nomeProduto.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O nome do produto é obrigatório."
                });
            }

            if (
                preco === undefined ||
                preco === null ||
                typeof preco !== "number" ||
                !Number.isFinite(preco)
            ) {
                return res.status(400).json({
                    mensagem: "O preço é obrigatório e deve ser um número."
                });
            }

            if (preco < 0) {
                return res.status(400).json({
                    mensagem: "O preço não pode ser negativo."
                });
            }

            if (
                !disponibilidade ||
                typeof disponibilidade !== "string" ||
                disponibilidade.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "A disponibilidade é obrigatória."
                });
            }

            const dadosRecebidosProduto = {
                nomeProduto: nomeProduto.trim(),
                preco,
                disponibilidade: disponibilidade.trim()
            };

            console.log(
                "Dados recebidos do produto:",
                dadosRecebidosProduto
            );

            const respostaModelo =
                await Produto.cadastrarProduto(
                    dadosRecebidosProduto
                );

            if (respostaModelo) {
                return res.status(201).json({
                    mensagem: "Produto cadastrado com sucesso."
                });
            }

            return res.status(400).json({
                mensagem: "Erro ao cadastrar produto."
            });

        } catch (error) {

            console.error(`Erro no modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível inserir o produto."
            });
        }
    }

    static async id(req: Request, res: Response): Promise<Response> {
        try {

            const idProduto: number =
                parseInt(req.params.idProduto as string);

            const respostaModel =
                await Produto.listarProdutoId(idProduto);

            return res.status(200).json(respostaModel);

        } catch (error) {

            console.error(`Erro no modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível obter informações do produto."
            });
        }
    }
}

export default ProdutoController;