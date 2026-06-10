import Pedido from "../model/Pedido.js";
import type { Request, Response } from "express";

class PedidoController extends Pedido {
    static async todos(req: Request, res: Response): Promise<Response> {
        try {

            const listaPedido: Array<Pedido> | null = await Pedido.listarPedido();


            // Normalizar para objetos simples — evita perda de campos privados na serialização
            if (!listaPedido) {
                return res.status(200).json([]);
            }

            const payload = listaPedido.map((p: any) => ({
                idPedido: typeof p.getIdPedido === 'function' ? p.getIdPedido() : (p.id_pedido ?? p.idPedido ?? null),
                idCliente: typeof p.getIdCliente === 'function' ? p.getIdCliente() : (p.id_cliente ?? p.idCliente ?? null),
                idProduto: typeof p.getIdProduto === 'function' ? p.getIdProduto() : (p.id_produto ?? p.idProduto ?? null),
                dataPedido: typeof p.getDataPedido === 'function' ? p.getDataPedido() : (p.data_pedido ?? p.dataPedido ?? null),
                valorTotal: typeof p.getValorTotal === 'function' ? p.getValorTotal() : (p.valor_total ?? p.valorTotal ?? 0),
                statusPedido: typeof p.getStatusPedido === 'function' ? p.getStatusPedido() : (p.status_pedido ?? p.statusPedido ?? ""),
            }));

            console.log("Enviando payload pedidos:", JSON.stringify(payload[0]));

            return res.status(200).json(payload);
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
            if (!respostaModel) return res.status(200).json(null);

            const obj = {
                idPedido: respostaModel.getIdPedido(),
                idCliente: respostaModel.getIdCliente(),
                idProduto: respostaModel.getIdProduto(),
                dataPedido: respostaModel.getDataPedido(),
                valorTotal: respostaModel.getValorTotal(),
                statusPedido: respostaModel.getStatusPedido(),
            };

            console.log("Enviando payload pedido por id:", JSON.stringify(obj));

            return res.status(200).json(obj);
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível obter informações do pedido." });
        }
    }
}

export default PedidoController;