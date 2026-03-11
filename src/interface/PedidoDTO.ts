export interface PedidoDTO {
    idPedido: number,
    idCliente: number,
    idProduto: number,
    dataPedido: Date,
    valorTotal: number,
    statusPedido: string
}