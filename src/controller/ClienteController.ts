import Cliente from "../model/Cliente.js";
import type { Request, Response } from "express";
import type { ClienteDTO } from "../interface/ClienteDTO.js";

class ClienteController {

    // LISTAR TODOS OS CLIENTES
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            const listaClientes: ClienteDTO[] = await Cliente.listarClientes();

            if (listaClientes.length === 0) {
                return res.status(204).send();
            }

            return res.status(200).json(listaClientes);

        } catch (error) {
            console.error("Erro ao listar clientes:", error);

            return res.status(500).json({
                mensagem: "Não foi possível acessar a lista de clientes."
            });
        }
    }


    // BUSCAR CLIENTE PELO ID
    static async id(req: Request, res: Response): Promise<Response> {
        try {
            const idCliente = parseInt(req.params.idCliente as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                return res.status(400).json({
                    mensagem: "ID do cliente inválido."
                });
            }

            const cliente: ClienteDTO =
                await Cliente.listarCliente(idCliente);

            return res.status(200).json(cliente);

        } catch (error: any) {
            console.error("Erro ao buscar cliente:", error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({
                    mensagem: error.message
                });
            }

            return res.status(500).json({
                mensagem: "Não foi possível obter o cliente."
            });
        }
    }


    // CADASTRAR CLIENTE
    static async novo(req: Request, res: Response): Promise<Response> {
        try {
            const {
                nome,
                endereco,
                telefone,
                cpf
            } = req.body;


            // VALIDAÇÃO DO NOME
            if (
                !nome ||
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O nome do cliente é obrigatório."
                });
            }


            // VALIDAÇÃO DO ENDEREÇO
            if (
                !endereco ||
                typeof endereco !== "string" ||
                endereco.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O endereço do cliente é obrigatório."
                });
            }


            // VALIDAÇÃO DO TELEFONE
            if (
                !telefone ||
                typeof telefone !== "string" ||
                telefone.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O telefone do cliente é obrigatório."
                });
            }


            // VALIDAÇÃO DO CPF
            if (
                cpf !== undefined &&
                typeof cpf !== "string"
            ) {
                return res.status(400).json({
                    mensagem: "O CPF deve ser informado como texto."
                });
            }


            const novoCliente: ClienteDTO = {
                nome: nome.trim(),
                endereco: endereco.trim(),
                telefone: telefone.trim(),
                cpf: cpf?.trim()
            };


            const resultado = await Cliente.cadastrarCliente(novoCliente);


            if (resultado) {
                return res.status(201).json({
                    mensagem: "Cliente cadastrado com sucesso."
                });
            }

            return res.status(400).json({
                mensagem: "Não foi possível cadastrar o cliente."
            });

        } catch (error) {
            console.error("Erro ao cadastrar cliente:", error);

            return res.status(500).json({
                mensagem: "Não foi possível cadastrar o cliente."
            });
        }
    }


    // ATUALIZAR CLIENTE
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const idCliente = parseInt(req.params.idCliente as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                return res.status(400).json({
                    mensagem: "ID do cliente inválido."
                });
            }


            const {
                nome,
                endereco,
                telefone,
                cpf
            } = req.body;


            // VALIDAÇÃO DO NOME
            if (
                !nome ||
                typeof nome !== "string" ||
                nome.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O nome do cliente é obrigatório."
                });
            }


            // VALIDAÇÃO DO ENDEREÇO
            if (
                !endereco ||
                typeof endereco !== "string" ||
                endereco.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O endereço do cliente é obrigatório."
                });
            }


            // VALIDAÇÃO DO TELEFONE
            if (
                !telefone ||
                typeof telefone !== "string" ||
                telefone.trim() === ""
            ) {
                return res.status(400).json({
                    mensagem: "O telefone do cliente é obrigatório."
                });
            }


            // VALIDAÇÃO DO CPF
            if (
                cpf !== undefined &&
                typeof cpf !== "string"
            ) {
                return res.status(400).json({
                    mensagem: "O CPF deve ser informado como texto."
                });
            }


            const clienteAtualizado: ClienteDTO = {
                idCliente,
                nome: nome.trim(),
                endereco: endereco.trim(),
                telefone: telefone.trim(),
                cpf: cpf?.trim()
            };


            const resultado =
                await Cliente.atualizarCliente(clienteAtualizado);


            if (!resultado) {
                return res.status(400).json({
                    mensagem: "Não foi possível atualizar o cliente."
                });
            }


            return res.status(200).json({
                mensagem: "Cliente atualizado com sucesso."
            });

        } catch (error: any) {
            console.error("Erro ao atualizar cliente:", error);

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


    // REMOVER CLIENTE
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idCliente = parseInt(req.params.idCliente as string);

            if (isNaN(idCliente) || idCliente <= 0) {
                return res.status(400).json({
                    mensagem: "ID do cliente inválido."
                });
            }


            const resultado = await Cliente.removerCliente(idCliente);


            if (!resultado) {
                return res.status(400).json({
                    mensagem: "O cliente já está inativo."
                });
            }


            return res.status(200).json({
                mensagem: "Cliente removido com sucesso."
            });

        } catch (error: any) {
            console.error("Erro ao remover cliente:", error);

            if (error.message?.includes("não encontrado")) {
                return res.status(404).json({
                    mensagem: error.message
                });
            }

            return res.status(500).json({
                mensagem: "Não foi possível remover o cliente."
            });
        }
    }
}

export default ClienteController;