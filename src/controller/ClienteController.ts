import Cliente from "../model/Cliente.js";
import type { Request, Response } from "express";

class ClienteController extends Cliente {

    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaCliente: Array<Cliente> | null =
                await Cliente.listarCliente();

            return res.status(200).json(listaCliente);

        } catch (error) {
            console.error(`Erro ao consultar modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível acessar a lista de clientes."
            });
        }
    }

    static async novo(req: Request, res: Response): Promise<Response> {
        try {

            const {
                nome,
                email,
                endereco,
                telefone,
                cpf
            } = req.body;

            if (
                !nome ||
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O nome é obrigatório."
                });
            }

            if (
                !email ||
                typeof email !== "string" ||
                email.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O e-mail é obrigatório."
                });
            }

            const emailValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailValido.test(email.trim())) {
                return res.status(400).json({
                    mensagem: "Informe um e-mail válido."
                });
            }

            if (
                !endereco ||
                typeof endereco !== "string" ||
                endereco.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O endereço é obrigatório."
                });
            }

            if (
                telefone === undefined ||
                telefone === null ||
                typeof telefone !== "number" ||
                !Number.isFinite(telefone)
            ) {
                return res.status(400).json({
                    mensagem: "O telefone é obrigatório e deve ser um número."
                });
            }

            if (
                cpf !== undefined &&
                cpf !== null &&
                typeof cpf !== "number"
            ) {
                return res.status(400).json({
                    mensagem: "O CPF deve ser um número."
                });
            }

            const dadosRecebidosCliente = {
                nome: nome.trim(),
                email: email.trim(),
                endereco: endereco.trim(),
                telefone,
                cpf
            };

            const respostaModelo =
                await Cliente.cadastrarCliente(
                    dadosRecebidosCliente
                );

            if (respostaModelo) {
                return res.status(201).json({
                    mensagem: "Cliente cadastrado com sucesso."
                });
            }

            return res.status(400).json({
                mensagem: "Erro ao cadastrar cliente."
            });

        } catch (error) {

            console.error(`Erro no modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível inserir o cliente."
            });
        }
    }

    static async id(req: Request, res: Response): Promise<Response> {
        try {

            const idCliente: number =
                parseInt(req.params.idCliente as string);

            const respostaModel =
                await Cliente.listarClienteId(idCliente);

            return res.status(200).json(respostaModel);

        } catch (error) {

            console.error(`Erro no modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível obter informações do cliente."
            });
        }
    }
}

export default ClienteController;