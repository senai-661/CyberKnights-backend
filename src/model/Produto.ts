import { DatabaseModel } from "./DatabaseModel.js";
import { type ProdutoDTO } from "../interface/ProdutoDTO.js";

const database = new DatabaseModel().pool;

class Produto {
  private idProduto: number = 0;
  private nomeProduto: string;
  private preco: number;
  private disponibilidade: string;

  constructor(
    _nomeProduto: string,
    _preco: number,
    _disponibilidade: string,
  ) {
    this.nomeProduto = _nomeProduto;
    this.preco = _preco;
    this.disponibilidade = _disponibilidade;
  }

  public getIdProduto(): number {
    return this.idProduto;
  }

  public setIdProduto(_idProduto: number): void {
    this.idProduto = _idProduto;
  }

  public getNomeProduto(): string {
    return this.nomeProduto;
  }

  public setNomeProduto(_nomeProduto: string): void {
    this.nomeProduto = _nomeProduto;
  }
  public getPreco(): number {
    return this.preco;
  }

  public setPreco(_preco: number): void {
    this.preco = _preco;
  }

  public getDisponibilidade(): string {
    return this.disponibilidade;
  }

  public setDisponibilidade(_disponibilidade: string): void {
    this.disponibilidade = _disponibilidade;
  }

   static async cadastrarProduto(produto: ProdutoDTO): Promise<boolean> {
     try {
       const queryInsertProduto = `INSERT INTO produto (nome_produto, preco, disponibilidade)
                                 VALUES
                                 ($1, $2, $3)
                                 RETURNING id_produto;`;
 
       const respostaBD = await database.query(queryInsertProduto, [
         produto.nomeProduto.toUpperCase(),
         produto.preco,
         produto.disponibilidade
       ]);
       if (respostaBD.rows.length > 0) {
         console.info(`Produto cadastrado com sucesso. ID: ${respostaBD.rows[0].idProduto}`);
         return true;
       }
       return false;
     } catch (error) {
       console.error(`Erro na consulta ao banco de dados. ${error}`);
       return false;
     }
   }
 
  static async listarProduto(): Promise<Array<Produto> | null> {
    try {
      let listaDeProduto: Array<Produto> = [];
      const querySelectProduto = `SELECT * FROM produto ORDER BY nome_produto ASC;`;
      const respostaBD = await database.query(querySelectProduto);

      respostaBD.rows.forEach((produtoBD) => {
        const novoProduto: Produto = new Produto(
          produtoBD.nome_produto.toUpperCase(),
          produtoBD.preco,
          produtoBD.disponibilidade,
        );

        novoProduto.setIdProduto(produtoBD.id_produto);

        listaDeProduto.push(novoProduto);
      });

      return listaDeProduto;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);


      return null;
    }
  }

     static async listarProdutoId(idProduto: number): Promise<Produto | null> {
    try {
      const querySelectProduto = `SELECT * FROM produto WHERE id_produto=$1;`;
      const respostaBD = await database.query(querySelectProduto, [idProduto]);

        const novoProduto: Produto = new Produto(
          respostaBD.rows[0].nome_produto.toUpperCase(),
          respostaBD.rows[0].preco,
          respostaBD.rows[0].disponibilidade,
        );

        novoProduto.setIdProduto(respostaBD.rows[0].id_produto);

      return novoProduto;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);


      return null;
    }
  }
}

export default Produto;