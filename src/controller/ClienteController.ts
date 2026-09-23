import Cliente from "../model/Cliente.js";
import { type Request, type Response } from "express";
import type { ClienteDTO } from "../interface/ClienteDTO.js";

class ClienteController extends Cliente {

    static async todos(req: Request, res: Response) {
        try {
            const listaClientes: ClienteDTO[] = await Cliente.listarClientes();

            if (listaClientes.length === 0) {
                return res.status(204).send();
            }

            return res.status(200).json(listaClientes);

        } catch (error) {
            console.error(`[ClienteController] Erro ao listar clientes:`, error);
            res.status(500).json({
                mensagem: "Erro interno ao recuperar a lista de clientes."
            });
        }
    }

    static async cliente(req: Request, res: Response) {
        try {
            const idCliente = parseInt(req.params.idCliente as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const cliente: ClienteDTO =
                await Cliente.listarCliente(idCliente);

            return res.status(200).json(cliente);

        } catch (error: any) {
            console.error(
                `[ClienteController] Erro ao buscar cliente (id: ${req.params.idCliente}):`,
                error
            );

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({
                    mensagem: error.message
                });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao recuperar o cliente."
            });
        }
    }

    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: ClienteDTO = req.body;

            if (
                !dadosRecebidos.nome ||
                !dadosRecebidos.endereco ||
                !dadosRecebidos.email ||
                dadosRecebidos.telefone === undefined ||
                dadosRecebidos.cpf === undefined
            ) {
                res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: nome, endereco, email, telefone e cpf."
                });
                return;
            }

            const novoCliente = new Cliente(
                dadosRecebidos.nome,
                dadosRecebidos.endereco,
                dadosRecebidos.telefone,
                dadosRecebidos.cpf,
                dadosRecebidos.email
            );

            const result = await Cliente.cadastrarCliente(
                novoCliente as unknown as ClienteDTO
            );

            if (result) {
                res.status(201).json({
                    mensagem: "Cliente cadastrado com sucesso."
                });
            } else {
                res.status(400).json({
                    mensagem: "Não foi possível cadastrar o cliente."
                });
            }

        } catch (error) {
            console.error(`[ClienteController] Erro ao cadastrar cliente:`, error);

            res.status(500).json({
                mensagem: "Erro interno ao cadastrar o cliente."
            });
        }
    }

    static async remover(req: Request, res: Response) {
        try {
            const idCliente = parseInt(req.params.idCliente as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const result = await Cliente.removerCliente(idCliente);

            if (result) {
                res.status(200).json({
                    mensagem: "Cliente removido com sucesso."
                });
            } else {
                res.status(404).json({
                    mensagem: "Cliente não encontrado ou já está inativo."
                });
            }

        } catch (error: any) {
            console.error(
                `[ClienteController] Erro ao remover cliente (id: ${req.params.idCliente}):`,
                error
            );

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({
                    mensagem: error.message
                });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao remover o cliente."
            });
        }
    }

    static async atualizar(req: Request, res: Response) {
        try {
            const idCliente = parseInt(req.params.idCliente as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const dadosRecebidos: ClienteDTO = req.body;

            if (
                !dadosRecebidos.nome ||
                !dadosRecebidos.endereco ||
                dadosRecebidos.telefone === undefined
            ) {
                res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: nome, endereco e telefone."
                });
                return;
            }

            const cliente: ClienteDTO = {
                idCliente: idCliente,
                nome: dadosRecebidos.nome,
                endereco: dadosRecebidos.endereco,
                telefone: dadosRecebidos.telefone,
                ...(dadosRecebidos.cpf !== undefined
                    ? { cpf: dadosRecebidos.cpf }
                    : {}),
                ...(dadosRecebidos.email !== undefined
                    ? { email: dadosRecebidos.email }
                    : {})
            };

            const result = await Cliente.atualizarCliente(cliente);

            if (result) {
                res.status(200).json({
                    mensagem: "Cadastro atualizado com sucesso."
                });
            } else {
                res.status(404).json({
                    mensagem: "Cliente não encontrado ou já está inativo."
                });
            }

        } catch (error: any) {
            console.error(
                `[ClienteController] Erro ao atualizar cliente (id: ${req.params.idCliente}):`,
                error
            );

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({
                    mensagem: error.message
                });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao atualizar o cliente."
            });
        }
    }

    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const {
                nome,
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
                    mensagem: "O nome do cliente é obrigatório."
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
                    mensagem: "O endereço do cliente é obrigatório."
                });
            }

            const telefoneNormalizado =
                telefone === undefined || telefone === null
                    ? ""
                    : String(telefone).replace(/\D/g, "");

            const cpfNormalizado =
                cpf === undefined || cpf === null
                    ? ""
                    : String(cpf).replace(/\D/g, "");

            if (!telefoneNormalizado) {
                return res.status(400).json({
                    mensagem: "O telefone é obrigatório."
                });
            }

            if (
                telefoneNormalizado.length < 10 ||
                telefoneNormalizado.length > 11
            ) {
                return res.status(400).json({
                    mensagem: "O telefone deve ter 10 ou 11 dígitos."
                });
            }

            // VALIDAÇÃO DO CPF
            if (
                cpf !== undefined &&
                cpf !== null &&
                !cpfNormalizado
            ) {
                return res.status(400).json({
                    mensagem: "O CPF informado é inválido."
                });
            }

            if (
                cpfNormalizado &&
                cpfNormalizado.length !== 11
            ) {
                return res.status(400).json({
                    mensagem: "O CPF deve ter 11 dígitos."
                });
            }

            const dadosRecebidosCliente: ClienteDTO = {
                nome: nome.trim(),
                endereco: endereco.trim(),
                telefone: telefoneNormalizado,
                ...(cpfNormalizado
                    ? { cpf: cpfNormalizado }
                    : {})
            };

            const respostaModelo =
                await Cliente.cadastrarCliente(
                    dadosRecebidosCliente
                );


            if (resultado) {
                return res.status(201).json({
                    mensagem: "Cliente cadastrado com sucesso."
                });
            }

            return res.status(400).json({
                mensagem: "Não foi possível cadastrar o cliente."
            });

        } catch (error) {
            console.error(`Erro no modelo. ${error}`);

            return res.status(500).json({
                mensagem: "Não foi possível cadastrar o cliente."
            });
        }
    }

    static async id(req: Request, res: Response): Promise<Response> {
        try {
            const idCliente = parseInt(
                req.params.idCliente as string
            );

            if (isNaN(idCliente) || idCliente <= 0) {
                return res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
            }

            const respostaModel =
                await Cliente.listarCliente(idCliente);

            return res.status(200).json(respostaModel);

        } catch (error: any) {
            console.error(
                `[ClienteController] Erro ao buscar cliente (id: ${req.params.idCliente}):`,
                error
            );

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({
                    mensagem: error.message
                });
            }

            return res.status(500).json({
                mensagem: "Não foi possível atualizar o cliente."
            });
        }
    }
}

export default ClienteController;