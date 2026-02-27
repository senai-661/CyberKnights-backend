import { DatabaseModel } from "./DatabaseModel.js";
import { type PedidoDTO } from "../interface/PedidoDTO.js";

const database = new DatabaseModel().pool;

class Pedido {
  private idPedido: number = 0;
  private idCliente: number;
  private idProduto: number;
  private dataPedido: Date;
  private valorTotal: number;
  private status: string;

  constructor(
    _idCliente: number,
    _idProduto: number,
    _dataPedido: Date,
    _valorTotal: number,
    _status: string
  ) {
    this.idCliente = _idCliente;
    this.idProduto = _idProduto;
    this.dataPedido = _dataPedido;
    this.valorTotal = _valorTotal;
    this.status = _status;
  }

  public getIdPedido(): number {
    return this.idPedido;
  }

  public setIdPedido(_idPedido: number): void {
    this.idPedido = _idPedido;
  }

  public getIdCliente(): number {
    return this.idCliente;
  }

  public setIdCliente(_idCliente: number): void {
    this.idCliente = _idCliente;
  }

  public getIdProduto(): number {
    return this.idProduto;
  }

  public setIdProduto(_idProduto: number): void {
    this.idProduto = _idProduto;
  }
  public getDataPedido(): Date {
    return this.dataPedido;
  }

  public setDataPedido(_dataPedido: Date): void {
    this.dataPedido = _dataPedido;
  }



  public getValorTotal(): number {
    return this.valorTotal;
  }

  public setValorTotal(_valorTotal: number): void {
    this.valorTotal = _valorTotal;
  }

  public getStatus(): string {
    return this.status;
  }

  public setStatus(_status: string): void {
    this.status = _status;
  }


  static async cadastrarPedido(pedido: PedidoDTO): Promise<boolean> {
    try {
      const queryInsertProduto = `INSERT INTO pedido (id_cliente, id_produto, data_pedido, valor_total, status)
                                   VALUES
                                   ($1, $2, $3, $4, $5)
                                   RETURNING id_pedido;`;

      const respostaBD = await database.query(queryInsertProduto, [
        pedido.idCliente,
        pedido.idProduto,
        pedido.dataPedido,
        pedido.valorTotal,
        pedido.status
      ]);
      if (respostaBD.rows.length > 0) {
        console.info(`Pedido cadastrado com sucesso. ID: ${respostaBD.rows[0].idPedido}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);
      return false;
    }
  }
  static async listarPedido(): Promise<Array<Pedido> | null> {
    try {
      let listaDePedido: Array<Pedido> = [];
      const querySelectPedido = `SELECT * FROM pedido ORDER BY data_pedido DESC;`;
      const respostaBD = await database.query(querySelectPedido);

      respostaBD.rows.forEach((pedidoBD) => {
        const novoPedido: Pedido = new Pedido(
          pedidoBD.id_cliente,
          pedidoBD.id_produto,
          pedidoBD.data_pedido,
          pedidoBD.valor_total,
          pedidoBD.status
        );

        novoPedido.setIdPedido(pedidoBD.idPedido);

        listaDePedido.push(novoPedido);
      });

      return listaDePedido;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);


      return null;
    }
  }

       static async listarPedidoId(idPedido: number): Promise<Pedido | null> {
    try {
      const querySelectPedido = `SELECT * FROM pedido WHERE id_pedido=$1;`;
      const respostaBD = await database.query(querySelectPedido, [idPedido]);

        const novoPedido: Pedido = new Pedido(
          respostaBD.rows[0].id_cliente,
          respostaBD.rows[0].id_produto,
          respostaBD.rows[0].data_pedido,
          respostaBD.rows[0].valor_total,
          respostaBD.rows[0].status
        );

        novoPedido.setIdPedido(respostaBD.rows[0].id_pedido);

      return novoPedido;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);


      return null;
    }
  }
}

export default Pedido;