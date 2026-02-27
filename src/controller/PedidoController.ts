import Pedido from "../model/Pedido.js";
import type { Request, Response } from "express";

class PedidoController extends Pedido {
    static async todos(req: Request, res: Response): Promise<Response> {
        try {

            const listaPedido: Array<Pedido> | null = await Pedido.listarPedido();


            return res.status(200).json(listaPedido);
        } catch (error) {

            console.error(`Erro ao consultar modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possivel acessar a lista de pedidos." });
        }
    }

        static async novo(req: Request, res: Response): Promise<Response> {
        try {
            console.log(req.body);
            const dadosRecebidosPedido = req.body;
            const respostaModelo = await Pedido.cadastrarPedido(dadosRecebidosPedido);

            if (respostaModelo) {
                return res.status(201).json({ mensagem: "Pedido cadastrado com sucesso." });
            } else {
                return res.status(400).json({ mensagem: "Erro ao cadastrar pedido." });
            }
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível inserir o pedido." });
        }
    }

    static async id(req: Request, res: Response): Promise<Response> {
        try {
            const idPedido: number = parseInt(req.params.idPedido as string);
            const respostaModel = await Pedido.listarPedidoId(idPedido);
            return res.status(200).json(respostaModel);
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível obter informações do pedido." });
        }
    }
}

export default PedidoController;