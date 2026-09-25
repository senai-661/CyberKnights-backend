export interface PedidoDTO {
    idPedido?: number,
    idCliente: number,
    idProduto: number,
    nomeCliente?: string,
    nomeProduto?: string,
    quantidade?: number,
    dataPedido: Date,
    valorTotal: number,
    statusPedido: string,
    formaPagamento?: 'dinheiro' | 'cartao' | 'pix',
    pago?: boolean
}