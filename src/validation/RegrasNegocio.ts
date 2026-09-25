export const MENSAGEM_PEDIDO_MINIMO = "Pedido não finalizado. O valor mínimo para pedidos é de R$15,00.";
export const MENSAGEM_PRODUTO_INDISPONIVEL = "Produto indisponível no momento. Por favor, escolha outro item do cardápio.";
export const MENSAGEM_PAGAMENTO_PENDENTE = "Estamos quase lá. Efetue o pagamento para confirmarmos o seu pedido.";

export const formasPagamento = ["dinheiro", "cartao", "pix"] as const;
export type FormaPagamento = typeof formasPagamento[number];

export function produtoDisponivel(disponibilidade: string): boolean {
    const valor = disponibilidade.trim().toLowerCase();
    return valor === "disponível" || valor === "disponivel";
}

export function validarPedidoBasico(dados: {
    idCliente?: number;
    idProduto?: number;
    quantidade?: number;
    dataPedido?: Date | string;
    valorTotal?: number;
    formaPagamento?: string;
}): string | null {
    if (dados.idCliente === undefined || !Number.isInteger(dados.idCliente) || dados.idCliente <= 0
        || dados.idProduto === undefined || !Number.isInteger(dados.idProduto) || dados.idProduto <= 0
        || dados.quantidade === undefined || !Number.isInteger(dados.quantidade) || dados.quantidade <= 0
        || dados.dataPedido === undefined || Number.isNaN(new Date(dados.dataPedido).getTime())
        || dados.valorTotal === undefined || !Number.isFinite(dados.valorTotal)) {
        return "Informe dados válidos para cliente, produto, data e valor do pedido.";
    }

    if (dados.valorTotal < 15) return MENSAGEM_PEDIDO_MINIMO;
    if (!dados.formaPagamento || !formasPagamento.includes(dados.formaPagamento as FormaPagamento)) {
        return "Selecione uma forma de pagamento válida.";
    }

    return null;
}

export function statusDoPedido(pago: boolean): "Em preparo" | "Aguardando pagamento" {
    return pago ? "Em preparo" : "Aguardando pagamento";
}

export function validarCliente(dados: {
    nome?: unknown;
    endereco?: unknown;
    telefone?: unknown;
    email?: unknown;
    cpf?: unknown;
}): string | null {
    if (typeof dados.nome !== "string" || !dados.nome.trim()) return "O nome é obrigatório.";
    if (typeof dados.endereco !== "string" || !dados.endereco.trim()) return "O endereço é obrigatório.";

    const telefone = String(dados.telefone ?? "").replace(/\D/g, "");
    if (!telefone) return "O telefone é obrigatório.";
    if (telefone.length < 10 || telefone.length > 11) return "O telefone deve ter 10 ou 11 dígitos.";

    if (dados.email !== undefined && dados.email !== null && dados.email !== "") {
        if (typeof dados.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
            return "Informe um e-mail válido.";
        }
    }

    const cpf = String(dados.cpf ?? "").replace(/\D/g, "");
    if (dados.cpf !== undefined && dados.cpf !== null && !cpf) return "O CPF informado é inválido.";
    if (cpf && cpf.length !== 11) return "O CPF deve ter 11 dígitos.";

    return null;
}
