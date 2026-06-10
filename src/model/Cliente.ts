// Importa o tipo ClienteDTO, que define a "forma" dos dados de um cliente (como um molde/contrato)
// DTO (Data Transfer Object) é um objeto simples usado para trafegar dados entre camadas da aplicação
import type { ClienteDTO } from "../interface/ClienteDTO.js";

// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
const database = new DatabaseModel().pool;

// Define a classe Cliente, que representa a entidade cliente no sistema
class Cliente {

    // ==================== ATRIBUTOS PRIVADOS ====================
    private idCliente: number = 0;
    private nome: string;
    private endereco: string;
    private email: string | undefined;
    private telefone: string;
    private cpf: string | undefined;
    private statusCliente: boolean = true;

    // ==================== CONSTRUTOR ====================
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

    // ==================== GETTERS E SETTERS ====================
    public getIdCliente(): number { return this.idCliente; }
    public setIdCliente(_idCliente: number): void { this.idCliente = _idCliente; }

    public getNome(): string { return this.nome; }
    public setNome(_nome: string): void { this.nome = _nome; }

    public getEndereco(): string { return this.endereco; }
    public setEndereco(_endereco: string): void { this.endereco = _endereco; }

    public getEmail(): string | undefined { return this.email; }
    public setEmail(_email?: string): void { this.email = _email; }

    public getTelefone(): string { return this.telefone; }
    public setTelefone(_telefone: string): void { this.telefone = _telefone; }

    public getCpf(): string | undefined { return this.cpf; }
    public setCpf(_cpf: string): void { this.cpf = _cpf; }

    public getStatusCliente(): boolean { return this.statusCliente; }
    public setStatusCliente(_statusCliente: boolean): void { this.statusCliente = _statusCliente; }

    // ==================== MÉTODO PRIVADO: toDTO ====================
    /**
     * Converte uma linha bruta retornada pelo banco de dados em um objeto ClienteDTO estruturado.
     *
     * @param cliente Linha retornada pelo banco de dados (tipagem any pois vem do driver do PostgreSQL)
     * @returns Objeto ClienteDTO com os campos mapeados
     */
    private static toDTO(cliente: any): ClienteDTO {
        return {
            idCliente: cliente.id_cliente,
            nome: cliente.nome,
            endereco: cliente.endereco,
            telefone: cliente.telefone,
            cpf: cliente.cpf
        };
    }

    // ==================== MÉTODOS ESTÁTICOS (acesso ao banco de dados) ====================

    /**
     * Busca e retorna todos os clientes com status ativo no banco de dados.
     *
     * @returns Promise com array de ClienteDTO contendo todos os clientes ativos.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarClientes(): Promise<ClienteDTO[]> {
        try {
            const query = `SELECT * FROM cliente WHERE status_cliente = TRUE ORDER BY nome ASC;`;
            const respostaBD = await database.query(query);

            return respostaBD.rows.map(Cliente.toDTO);
        } catch (error) {
            console.error(`[ClienteModel] Erro ao listar clientes:`, error);
            throw error;
        }
    }

    /**
     * Busca e retorna os dados de um cliente específico pelo seu ID.
     *
     * @param idCliente Identificador único do cliente no banco de dados.
     * @returns Promise com ClienteDTO contendo os dados do cliente encontrado.
     * @throws Error com mensagem "não encontrado" se nenhum cliente com o ID informado existir.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarCliente(idCliente: number): Promise<ClienteDTO> {
        try {
            const querySelectCliente = `SELECT * FROM cliente WHERE id_cliente = $1`;
            const respostaBD = await database.query(querySelectCliente, [idCliente]);

            if (respostaBD.rows.length === 0) {
                throw new Error(`Cliente com ID ${idCliente} não encontrado.`);
            }

            return Cliente.toDTO(respostaBD.rows[0]);
        } catch (error) {
            console.error(`[ClienteModel] Erro ao buscar cliente (id: ${idCliente}):`, error);
            throw error;
        }
    }

    /**
     * Cadastra um novo cliente no banco de dados.
     * Nome e endereço são salvos em maiúsculas; e-mail em minúsculas.
     *
     * @param cliente Objeto ClienteDTO contendo os dados a serem cadastrados.
     * @returns Promise com true se o cadastro foi realizado com sucesso.
     * @throws Error se o INSERT não retornar o ID gerado ou ocorrer falha no banco.
     */
    static async cadastrarCliente(cliente: ClienteDTO): Promise<boolean> {
        try {

            const queryInsertCliente = `
                INSERT INTO cliente (
                    nome,
                    endereco,
                    telefone,
                    cpf,
                    status_cliente
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id_cliente;
            `;

            const valores = [
                cliente.nome.toUpperCase(),
                cliente.endereco.toUpperCase(),
                cliente.telefone,
                cliente.cpf,
                true
            ];

            const result = await database.query(queryInsertCliente, valores);

            if (result.rows.length === 0) {
                throw new Error("INSERT não retornou ID — cadastro pode ter falhado silenciosamente.");
            }

            console.info(`[ClienteModel] Cliente cadastrado com sucesso. ID: ${result.rows[0].id_cliente}`);
            return true;
        } catch (error) {
            console.error(`[ClienteModel] Erro ao cadastrar cliente:`, error);
            throw error;
        }
    }

    /**
     * Atualiza os dados cadastrais de um cliente existente no banco de dados.
     * Verifica se o cliente existe e está ativo antes de executar o UPDATE.
     *
     * @param cliente Objeto ClienteDTO com os novos dados. O atributo idCliente deve estar
     *                preenchido para identificar qual registro será atualizado no banco.
     * @returns Promise com true se a atualização foi bem-sucedida.
     * @throws Error se o cliente não for encontrado, estiver inativo ou ocorrer falha no banco.
     */
    static async atualizarCliente(cliente: ClienteDTO): Promise<boolean> {
        try {
            if (!cliente.idCliente) {
                throw new Error("idCliente é obrigatório para atualização.");
            }

            const clienteConsulta: ClienteDTO = await Cliente.listarCliente(cliente.idCliente);


            const queryAtualizarCliente = `
                UPDATE cliente SET
                    nome     = $1,
                    endereco = $2,
                    telefone = $3,
                    cpf      = $4
                WHERE id_cliente = $5
            `;

            const valores = [
                cliente.nome.toUpperCase(),
                cliente.endereco.toUpperCase(),
                cliente.telefone,
                cliente.cpf,
                cliente.idCliente
            ];

            const respostaBD = await database.query(queryAtualizarCliente, valores);

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[ClienteModel] Erro ao atualizar cliente (id: ${cliente.idCliente}):`, error);
            throw error;
        }
    }

    /**
     * Remove logicamente um cliente do sistema (status_cliente = FALSE).
     * Não apaga o registro do banco — apenas desativa.
     *
     * @param idCliente ID do cliente a ser removido.
     * @returns Promise com true se a remoção foi bem-sucedida, false se já estava inativo.
     * @throws Error se o cliente não for encontrado ou ocorrer falha no banco de dados.
     */
    static async removerCliente(idCliente: number): Promise<boolean> {
        try {
            const querySelect = `SELECT status_cliente FROM cliente WHERE id_cliente = $1`;
            const respostaSelect = await database.query(querySelect, [idCliente]);

            if (respostaSelect.rows.length === 0) {
                throw new Error(`Cliente com ID ${idCliente} não encontrado.`);
            }

            if (!respostaSelect.rows[0].status_cliente) {
                return false;
            }

            const queryUpdate = `UPDATE cliente SET status_cliente = FALSE WHERE id_cliente = $1`;
            const respostaUpdate = await database.query(queryUpdate, [idCliente]);

            return (respostaUpdate.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[ClienteModel] Erro ao remover cliente (id: ${idCliente}):`, error);
            throw error;
        }
    }
}

export default Cliente;