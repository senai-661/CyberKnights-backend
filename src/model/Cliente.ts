import type { ClienteDTO } from "../interface/ClienteDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Cliente {
    private idCliente: number = 0;
    private nome: string;
    private endereco: string;
    private email: string | undefined;
    private telefone: string;
    private cpf: string | undefined;

    constructor(
        _nome: string,
        _endereco: string,
        _telefone: string,
        _cpf?: string,
        _email?: string
    ) {
        this.nome = _nome;
        this.endereco = _endereco;
        this.telefone = _telefone;
        this.cpf = _cpf;
        this.email = _email;
    }

    public getIdCliente(): number {
        return this.idCliente;
    }

    public setIdCliente(_idCliente: number): void {
        this.idCliente = _idCliente;
    }

    public getNome(): string {
        return this.nome;
    }

    public setNome(_nome: string): void {
        this.nome = _nome;
    }

    public getEndereco(): string {
        return this.endereco;
    }

    public setEndereco(_endereco: string): void {
        this.endereco = _endereco;
    }

    public getEmail(): string | undefined {
        return this.email;
    }

    public setEmail(_email?: string): void {
        this.email = _email;
    }

    public getTelefone(): string {
        return this.telefone;
    }

    public setTelefone(_telefone: string): void {
        this.telefone = _telefone;
    }

    public getCpf(): string | undefined {
        return this.cpf;
    }

    public setCpf(_cpf: string): void {
        this.cpf = _cpf;
    }

    private static toDTO(cliente: any): ClienteDTO {
        return {
            idCliente: cliente.id_cliente,
            nome: cliente.nome,
            endereco: cliente.endereco,
            email: cliente.email,
            telefone: cliente.telefone,
            cpf: cliente.cpf
        };
    }

    static async listarClientes(): Promise<ClienteDTO[]> {
        try {
            const query = `
                SELECT *
                FROM cliente
                ORDER BY nome ASC;
            `;

            const respostaBD = await database.query(query);

            return respostaBD.rows.map(Cliente.toDTO);
        } catch (error) {
            console.error(`[ClienteModel] Erro ao listar clientes:`, error);
            throw error;
        }
    }

    static async listarCliente(idCliente: number): Promise<ClienteDTO> {
        try {
            const querySelectCliente = `
                SELECT *
                FROM cliente
                WHERE id_cliente = $1;
            `;

            const respostaBD = await database.query(
                querySelectCliente,
                [idCliente]
            );

            if (respostaBD.rows.length === 0) {
                throw new Error(`Cliente com ID ${idCliente} não encontrado.`);
            }

            return Cliente.toDTO(respostaBD.rows[0]);
        } catch (error) {
            console.error(
                `[ClienteModel] Erro ao buscar cliente (id: ${idCliente}):`,
                error
            );

            throw error;
        }
    }

    static async cadastrarCliente(cliente: ClienteDTO): Promise<boolean> {
        try {
            const queryInsertCliente = `
                INSERT INTO cliente (
                    nome,
                    endereco,
                    email,
                    telefone,
                    cpf
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id_cliente;
            `;

            const valores = [
                cliente.nome.toUpperCase(),
                cliente.endereco.toUpperCase(),
                cliente.email?.trim().toLowerCase(),
                cliente.telefone,
                cliente.cpf
            ];

            const result = await database.query(
                queryInsertCliente,
                valores
            );

            if (result.rows.length === 0) {
                throw new Error(
                    "INSERT não retornou ID — cadastro pode ter falhado silenciosamente."
                );
            }

            console.info(
                `[ClienteModel] Cliente cadastrado com sucesso. ID: ${result.rows[0].id_cliente}`
            );

            return true;
        } catch (error) {
            console.error(
                `[ClienteModel] Erro ao cadastrar cliente:`,
                error
            );

            throw error;
        }
    }

    static async atualizarCliente(cliente: ClienteDTO): Promise<boolean> {
        try {
            if (!cliente.idCliente) {
                throw new Error("idCliente é obrigatório para atualização.");
            }

            await Cliente.listarCliente(cliente.idCliente);

            const queryAtualizarCliente = `
                UPDATE cliente SET
                    nome = $1,
                    endereco = $2,
                    email = $3,
                    telefone = $4,
                    cpf = $5
                WHERE id_cliente = $6;
            `;

            const valores = [
                cliente.nome.toUpperCase(),
                cliente.endereco.toUpperCase(),
                cliente.email?.trim().toLowerCase(),
                cliente.telefone,
                cliente.cpf,
                cliente.idCliente
            ];

            const respostaBD = await database.query(
                queryAtualizarCliente,
                valores
            );

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(
                `[ClienteModel] Erro ao atualizar cliente (id: ${cliente.idCliente}):`,
                error
            );

            throw error;
        }
    }

    static async removerCliente(idCliente: number): Promise<boolean> {
        try {
            const queryDelete = `
                DELETE FROM cliente
                WHERE id_cliente = $1;
            `;

            const respostaBD = await database.query(
                queryDelete,
                [idCliente]
            );

            if ((respostaBD.rowCount ?? 0) === 0) {
                throw new Error(
                    `Cliente com ID ${idCliente} não encontrado.`
                );
            }

            return true;
        } catch (error) {
            console.error(
                `[ClienteModel] Erro ao remover cliente (id: ${idCliente}):`,
                error
            );

            throw error;
        }
    }
}

export default Cliente;