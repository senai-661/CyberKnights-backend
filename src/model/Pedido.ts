// Importa o tipo PedidoDTO, que define a "forma" dos dados de um pedido (como um molde/contrato)
import type { PedidoDTO } from "../interface/PedidoDTO.js";

// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
const database = new DatabaseModel().pool;

// Define a classe Pedido, que representa a entidade pedido no sistema
class Pedido {

    // ==================== ATRIBUTOS PRIVADOS ====================
    private idPedido: number = 0;
    private idCliente: number;
    private idProduto: number;
    private dataPedido: Date;
    private valorTotal: number;
    private statusPedido: string;

    // ==================== CONSTRUTOR ====================
    constructor(
        _idCliente: number,
        _idProduto: number,
        _dataPedido: Date,
        _valorTotal: number,
        _statusPedido: string
    ) {
        this.idCliente = _idCliente;
        this.idProduto = _idProduto;
        this.dataPedido = _dataPedido;
        this.valorTotal = _valorTotal;
        this.statusPedido = _statusPedido;
    }

    // ==================== GETTERS E SETTERS ====================
    public getIdPedido(): number { return this.idPedido; }
    public setIdPedido(_idPedido: number): void { this.idPedido = _idPedido; }

    public getIdCliente(): number { return this.idCliente; }
    public setIdCliente(_idCliente: number): void { this.idCliente = _idCliente; }

    public getIdProduto(): number { return this.idProduto; }
    public setIdProduto(_idProduto: number): void { this.idProduto = _idProduto; }

    public getDataPedido(): Date { return this.dataPedido; }
    public setDataPedido(_dataPedido: Date): void { this.dataPedido = _dataPedido; }

    public getValorTotal(): number { return this.valorTotal; }
    public setValorTotal(_valorTotal: number): void { this.valorTotal = _valorTotal; }

    public getStatusPedido(): string { return this.statusPedido; }
    public setStatusPedido(_statusPedido: string): void { this.statusPedido = _statusPedido; }

    // ==================== MÉTODO PRIVADO: toDTO ====================
    /**
     * Converte uma linha bruta retornada pelo banco de dados em um objeto PedidoDTO estruturado.
     *
     * @param pedido Linha retornada pelo banco de dados (tipagem any pois vem do driver do PostgreSQL)
     * @returns Objeto PedidoDTO com os campos mapeados
     */
    private static toDTO(pedido: any): PedidoDTO {
        return {
            idPedido: pedido.id_pedido,
            idCliente: pedido.id_cliente,
            idProduto: pedido.id_produto,
            dataPedido: pedido.data_pedido,
            valorTotal: pedido.valor_total,
            statusPedido: pedido.status_pedido
        };
    }

    // ==================== MÉTODOS ESTÁTICOS (acesso ao banco de dados) ====================

    /**
     * Busca e retorna todos os pedidos cadastrados no banco de dados, ordenados por data (mais recentes primeiro).
     *
     * @returns Promise com array de PedidoDTO contendo todos os pedidos.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarPedidos(): Promise<PedidoDTO[]> {
        try {
            const query = `SELECT * FROM pedido ORDER BY data_pedido DESC;`;
            const respostaBD = await database.query(query);

            return respostaBD.rows.map(Pedido.toDTO);
        } catch (error) {
            console.error(`[PedidoModel] Erro ao listar pedidos:`, error);
            throw error;
        }
    }

    /**
     * Busca e retorna os dados de um pedido específico pelo seu ID.
     *
     * @param idPedido Identificador único do pedido no banco de dados.
     * @returns Promise com PedidoDTO contendo os dados do pedido encontrado.
     * @throws Error com mensagem "não encontrado" se nenhum pedido com o ID informado existir.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarPedido(idPedido: number): Promise<PedidoDTO> {
        try {
            const querySelectPedido = `SELECT * FROM pedido WHERE id_pedido = $1`;
            const respostaBD = await database.query(querySelectPedido, [idPedido]);

            if (respostaBD.rows.length === 0) {
                throw new Error(`Pedido com ID ${idPedido} não encontrado.`);
            }

            return Pedido.toDTO(respostaBD.rows[0]);
        } catch (error) {
            console.error(`[PedidoModel] Erro ao buscar pedido (id: ${idPedido}):`, error);
            throw error;
        }
    }

    /**
     * Cadastra um novo pedido no banco de dados.
     *
     * @param pedido Objeto PedidoDTO contendo os dados a serem cadastrados.
     * @returns Promise com true se o cadastro foi realizado com sucesso.
     * @throws Error se o INSERT não retornar o ID gerado ou ocorrer falha no banco.
     */
    static async cadastrarPedido(pedido: PedidoDTO): Promise<boolean> {
        try {
            const queryInsertPedido = `
                INSERT INTO pedido (
                    id_cliente,
                    id_produto,
                    data_pedido,
                    valor_total,
                    status_pedido
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id_pedido;
            `;

            const valores = [
                pedido.idCliente,
                pedido.idProduto,
                pedido.dataPedido,
                pedido.valorTotal,
                pedido.statusPedido
            ];

            const result = await database.query(queryInsertPedido, valores);

            if (result.rows.length === 0) {
                throw new Error("INSERT não retornou ID — cadastro pode ter falhado silenciosamente.");
            }

            console.info(`[PedidoModel] Pedido cadastrado com sucesso. ID: ${result.rows[0].id_pedido}`);
            return true;
        } catch (error) {
            console.error(`[PedidoModel] Erro ao cadastrar pedido:`, error);
            throw error;
        }
    }

    /**
     * Atualiza os dados de um pedido existente no banco de dados.
     * Verifica se o pedido existe antes de executar o UPDATE.
     *
     * @param pedido Objeto PedidoDTO com os novos dados. O atributo idPedido deve estar
     *               preenchido para identificar qual registro será atualizado no banco.
     * @returns Promise com true se a atualização foi bem-sucedida.
     * @throws Error se o pedido não for encontrado ou ocorrer falha no banco de dados.
     */
    static async atualizarPedido(pedido: PedidoDTO): Promise<boolean> {
        try {
            if (!pedido.idPedido) {
                throw new Error("idPedido é obrigatório para atualização.");
            }

            // Garante que o pedido existe — lança "não encontrado" automaticamente se não existir
            await Pedido.listarPedido(pedido.idPedido);

            const queryAtualizarPedido = `
                UPDATE pedido SET
                    id_cliente   = $1,
                    id_produto   = $2,
                    data_pedido  = $3,
                    valor_total  = $4,
                    status_pedido = $5
                WHERE id_pedido = $6
            `;

            const valores = [
                pedido.idCliente,
                pedido.idProduto,
                pedido.dataPedido,
                pedido.valorTotal,
                pedido.statusPedido,
                pedido.idPedido
            ];

            const respostaBD = await database.query(queryAtualizarPedido, valores);

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[PedidoModel] Erro ao atualizar pedido (id: ${pedido.idPedido}):`, error);
            throw error;
        }
    }

    /**
     * Remove um pedido do banco de dados pelo ID.
     *
     * @param idPedido ID do pedido a ser removido.
     * @returns Promise com true se a remoção foi bem-sucedida.
     * @throws Error se o pedido não for encontrado ou ocorrer falha no banco de dados.
     */
    static async removerPedido(idPedido: number): Promise<boolean> {
        try {
            // Garante que o pedido existe — lança "não encontrado" automaticamente se não existir
            await Pedido.listarPedido(idPedido);

            const queryDelete = `DELETE FROM pedido WHERE id_pedido = $1`;
            const respostaBD = await database.query(queryDelete, [idPedido]);

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[PedidoModel] Erro ao remover pedido (id: ${idPedido}):`, error);
            throw error;
        }
    }

    /**
     * Busca pedidos com status "baixo" através da view vw_pedidos_completos_baixo.
     *
     * @returns Promise com array de objetos retornados pela view.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarPedidosBaixo(): Promise<Array<any>> {
        try {
            const querySelectView = `SELECT * FROM vw_pedidos_completos_baixo;`;
            const respostaBD = await database.query(querySelectView);
            return respostaBD.rows;
        } catch (error) {
            console.error(`[PedidoModel] Erro ao listar pedidos baixos:`, error);
            throw error;
        }
    }

    /**
     * Busca todos os pedidos com informações completas através da view vw_pedidos_completos.
     *
     * @returns Promise com array de objetos retornados pela view.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarPedidosCompleto(): Promise<Array<any>> {
        try {
            const querySelectView = `SELECT * FROM vw_pedidos_completos;`;
            const respostaBD = await database.query(querySelectView);
            return respostaBD.rows;
        } catch (error) {
            console.error(`[PedidoModel] Erro ao listar pedidos completos:`, error);
            throw error;
        }
    }
}

export default Pedido;