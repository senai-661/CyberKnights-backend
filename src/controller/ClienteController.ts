import Cliente from "../model/Cliente.js";
import type { Request, Response } from "express";

class ClienteController extends Cliente {
    static async todos(req: Request, res: Response): Promise<Response> {
        try {

            const listaCliente: Array<Cliente> | null = await Cliente.listarCliente();

            const clientes = listaCliente?.map((cliente) => ({
                idCliente: cliente.getIdCliente(),
                nome: cliente.getNome(),
                email: cliente.getEmail(),
                endereco: cliente.getEndereco(),
                telefone: cliente.getTelefone(),
                cpf: cliente.getCpf(),
            })) ?? [];

            return res.status(200).json(clientes);
        } catch (error) {

            console.error(`Erro ao consultar modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possivel acessar a lista de clientes." });
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
            const respostaModel = await Cliente.listarClienteId(idCliente);
            return res.status(200).json(respostaModel);
        } catch (error) {
            console.error(`Erro no modelo. ${error}`);
            return res.status(500).json({ mensagem: "Não foi possível obter informações do cliente." });
        }
    }

    static async deletar(req: Request, res: Response): Promise<Response> {
        const idCliente = Number.parseInt(req.params.idCliente as string, 10);
        if (Number.isNaN(idCliente)) return res.status(400).json({ mensagem: "ID de cliente inválido." });

        const resultado = await Cliente.deletarCliente(idCliente);
        if (resultado.conflict) return res.status(409).json({ mensagem: "Cliente possui pedidos vinculados." });
        if (!resultado.deleted) return res.status(404).json({ mensagem: "Cliente não encontrado." });
        return res.status(204).send();
    }

    static async atualizar(req: Request, res: Response): Promise<Response> {
        const idCliente = Number.parseInt(req.params.idCliente as string, 10);
        if (Number.isNaN(idCliente)) return res.status(400).json({ mensagem: "ID de cliente inválido." });
        const atualizado = await Cliente.atualizarCliente(idCliente, req.body);
        if (!atualizado) return res.status(404).json({ mensagem: "Cliente não encontrado ou dados inválidos." });
        return res.status(200).json({ mensagem: "Cliente atualizado com sucesso." });
    }
}

export default ClienteController;