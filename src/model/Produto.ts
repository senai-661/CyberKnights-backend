// Importa o tipo ProdutoDTO, que define a "forma" dos dados de um produto (como um molde/contrato)
import type { ProdutoDTO } from "../interface/ProdutoDTO.js";

// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
const database = new DatabaseModel().pool;

// Define a classe Produto, que representa a entidade produto no sistema
class Produto {

    // ==================== ATRIBUTOS PRIVADOS ====================
    private idProduto: number = 0;
    private nomeProduto: string;
    private preco: number;
    private disponibilidade: string;

    // ==================== CONSTRUTOR ====================
    constructor(
        _nomeProduto: string,
        _preco: number,
        _disponibilidade: string
    ) {
        this.nomeProduto = _nomeProduto;
        this.preco = _preco;
        this.disponibilidade = _disponibilidade;
    }

    // ==================== GETTERS E SETTERS ====================
    public getIdProduto(): number { return this.idProduto; }
    public setIdProduto(_idProduto: number): void { this.idProduto = _idProduto; }

    public getNomeProduto(): string { return this.nomeProduto; }
    public setNomeProduto(_nomeProduto: string): void { this.nomeProduto = _nomeProduto; }

    public getPreco(): number { return this.preco; }
    public setPreco(_preco: number): void { this.preco = _preco; }

    public getDisponibilidade(): string { return this.disponibilidade; }
    public setDisponibilidade(_disponibilidade: string): void { this.disponibilidade = _disponibilidade; }

    // ==================== MÉTODO PRIVADO: toDTO ====================
    /**
     * Converte uma linha bruta retornada pelo banco de dados em um objeto ProdutoDTO estruturado.
     *
     * @param produto Linha retornada pelo banco de dados (tipagem any pois vem do driver do PostgreSQL)
     * @returns Objeto ProdutoDTO com os campos mapeados
     */
    private static toDTO(produto: any): ProdutoDTO {
        return {
            idProduto: produto.id_produto,
            nomeProduto: produto.nome_produto,
            preco: produto.preco,
            disponibilidade: produto.disponibilidade
        };
    }

    // ==================== MÉTODOS ESTÁTICOS (acesso ao banco de dados) ====================

    /**
     * Busca e retorna todos os produtos cadastrados no banco de dados.
     *
     * @returns Promise com array de ProdutoDTO contendo todos os produtos.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarProdutos(): Promise<ProdutoDTO[]> {
        try {
            const query = `SELECT * FROM produto ORDER BY nome_produto ASC;`;
            const respostaBD = await database.query(query);

            return respostaBD.rows.map(Produto.toDTO);
        } catch (error) {
            console.error(`[ProdutoModel] Erro ao listar produtos:`, error);
            throw error;
        }
    }

    /**
     * Busca e retorna os dados de um produto específico pelo seu ID.
     *
     * @param idProduto Identificador único do produto no banco de dados.
     * @returns Promise com ProdutoDTO contendo os dados do produto encontrado.
     * @throws Error com mensagem "não encontrado" se nenhum produto com o ID informado existir.
     * @throws Error se ocorrer falha na consulta ao banco de dados.
     */
    static async listarProduto(idProduto: number): Promise<ProdutoDTO> {
        try {
            const querySelectProduto = `SELECT * FROM produto WHERE id_produto = $1`;
            const respostaBD = await database.query(querySelectProduto, [idProduto]);

            if (respostaBD.rows.length === 0) {
                throw new Error(`Produto com ID ${idProduto} não encontrado.`);
            }

            return Produto.toDTO(respostaBD.rows[0]);
        } catch (error) {
            console.error(`[ProdutoModel] Erro ao buscar produto (id: ${idProduto}):`, error);
            throw error;
        }
    }

    /**
     * Cadastra um novo produto no banco de dados.
     * Nome do produto é salvo em maiúsculas.
     *
     * @param produto Objeto ProdutoDTO contendo os dados a serem cadastrados.
     * @returns Promise com true se o cadastro foi realizado com sucesso.
     * @throws Error se o INSERT não retornar o ID gerado ou ocorrer falha no banco.
     */
    static async cadastrarProduto(produto: ProdutoDTO): Promise<boolean> {
        try {
            const queryInsertProduto = `
                INSERT INTO produto (
                    nome_produto,
                    preco,
                    disponibilidade
                )
                VALUES ($1, $2, $3)
                RETURNING id_produto;
            `;

            const valores = [
                produto.nomeProduto.toUpperCase(),
                produto.preco,
                produto.disponibilidade
            ];

            const result = await database.query(queryInsertProduto, valores);

            if (result.rows.length === 0) {
                throw new Error("INSERT não retornou ID — cadastro pode ter falhado silenciosamente.");
            }

            console.info(`[ProdutoModel] Produto cadastrado com sucesso. ID: ${result.rows[0].id_produto}`);
            return true;
        } catch (error) {
            console.error(`[ProdutoModel] Erro ao cadastrar produto:`, error);
            throw error;
        }
    }

    /**
     * Atualiza os dados de um produto existente no banco de dados.
     * Verifica se o produto existe antes de executar o UPDATE.
     *
     * @param produto Objeto ProdutoDTO com os novos dados. O atributo idProduto deve estar
     *                preenchido para identificar qual registro será atualizado no banco.
     * @returns Promise com true se a atualização foi bem-sucedida.
     * @throws Error se o produto não for encontrado ou ocorrer falha no banco de dados.
     */
    static async atualizarProduto(produto: ProdutoDTO): Promise<boolean> {
        try {
            if (!produto.idProduto) {
                throw new Error("idProduto é obrigatório para atualização.");
            }

            // Garante que o produto existe — lança "não encontrado" automaticamente se não existir
            await Produto.listarProduto(produto.idProduto);

            const queryAtualizarProduto = `
                UPDATE produto SET
                    nome_produto    = $1,
                    preco           = $2,
                    disponibilidade = $3
                WHERE id_produto = $4
            `;

            const valores = [
                produto.nomeProduto.toUpperCase(),
                produto.preco,
                produto.disponibilidade,
                produto.idProduto
            ];

            const respostaBD = await database.query(queryAtualizarProduto, valores);

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[ProdutoModel] Erro ao atualizar produto (id: ${produto.idProduto}):`, error);
            throw error;
        }
    }

    /**
     * Remove um produto do banco de dados pelo ID.
     *
     * @param idProduto ID do produto a ser removido.
     * @returns Promise com true se a remoção foi bem-sucedida.
     * @throws Error se o produto não for encontrado ou ocorrer falha no banco de dados.
     */
    static async removerProduto(idProduto: number): Promise<boolean> {
        try {
            // Garante que o produto existe — lança "não encontrado" automaticamente se não existir
            await Produto.listarProduto(idProduto);

            const queryDelete = `DELETE FROM produto WHERE id_produto = $1`;
            const respostaBD = await database.query(queryDelete, [idProduto]);

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[ProdutoModel] Erro ao remover produto (id: ${idProduto}):`, error);
            throw error;
        }
    }
}

export default Produto;