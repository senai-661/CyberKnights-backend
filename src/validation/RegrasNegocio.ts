export const MENSAGEM_PEDIDO_MINIMO = "Pedido não finalizado. O valor mínimo para pedidos é de R$15,00.";
export const MENSAGEM_PRODUTO_INDISPONIVEL = "Produto indisponível no momento. Por favor, escolha outro item do cardápio.";
export const MENSAGEM_PAGAMENTO_PENDENTE = "Estamos quase lá. Efetue o pagamento para confirmarmos o seu pedido.";

export const formasPagamento = ["dinheiro", "cartao", "pix"] as const;
export type FormaPagamento = typeof formasPagamento[number];
export const disponibilidadesProduto = ["disponível", "indisponível"] as const;

const emailValido = (valor: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

export function validarProduto(dados: {
    nomeProduto?: unknown;
    preco?: unknown;
    disponibilidade?: unknown;
}): string | null {
    if (typeof dados.nomeProduto !== "string" || !dados.nomeProduto.trim()) return "O nome do produto é obrigatório.";
    if (dados.nomeProduto.trim().length > 80) return "O nome do produto deve ter no máximo 80 caracteres.";

    const preco = typeof dados.preco === "number" ? dados.preco : Number.NaN;
    if (!Number.isFinite(preco) || preco < 0 || preco > 99999999.99
        || Math.abs(preco - Math.round(preco * 100) / 100) > 1e-8) {
        return "Informe um preço válido, entre R$0,00 e R$99.999.999,99, com até duas casas decimais.";
    }

    if (typeof dados.disponibilidade !== "string"
        || !disponibilidadesProduto.includes(dados.disponibilidade.trim().toLowerCase() as typeof disponibilidadesProduto[number])) {
        return "Selecione uma disponibilidade válida.";
    }
    return null;
}

export function produtoDisponivel(disponibilidade: string): boolean {
    const valor = disponibilidade.trim().toLowerCase();
    return valor === "disponível" || valor === "disponivel";
}

export function validarPedidoBasico(dados: {
    idCliente?: unknown;
    idProduto?: unknown;
    quantidade?: unknown;
    dataPedido?: unknown;
    valorTotal?: unknown;
    statusPedido?: unknown;
    formaPagamento?: unknown;
}): string | null {
    const dataRecebida = typeof dados.dataPedido === "string" || dados.dataPedido instanceof Date
        ? dados.dataPedido
        : undefined;
    const dataValida = dataRecebida !== undefined && !Number.isNaN(new Date(dataRecebida).getTime());
    const valorTotal = typeof dados.valorTotal === "number" ? dados.valorTotal : Number.NaN;

    if (typeof dados.idCliente !== "number" || !Number.isInteger(dados.idCliente) || dados.idCliente <= 0
        || typeof dados.idProduto !== "number" || !Number.isInteger(dados.idProduto) || dados.idProduto <= 0
        || typeof dados.quantidade !== "number" || !Number.isInteger(dados.quantidade)
        || dados.quantidade <= 0 || dados.quantidade > 2147483647
        || !dataValida || !Number.isFinite(valorTotal) || valorTotal > 99999999.99
        || Math.abs(valorTotal - Math.round(valorTotal * 100) / 100) > 1e-8) {
        return "Informe dados válidos para cliente, produto, data e valor do pedido.";
    }

    if (valorTotal < 15) return MENSAGEM_PEDIDO_MINIMO;
    if (dados.statusPedido !== undefined
        && (typeof dados.statusPedido !== "string" || !dados.statusPedido.trim() || dados.statusPedido.trim().length > 30)) {
        return "O status do pedido é obrigatório e deve ter no máximo 30 caracteres.";
    }
    if (dados.formaPagamento !== undefined && dados.formaPagamento !== null
        && (typeof dados.formaPagamento !== "string" || !formasPagamento.includes(dados.formaPagamento as FormaPagamento))) {
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
    if (dados.nome.trim().length > 80) return "O nome deve ter no máximo 80 caracteres.";
    if (typeof dados.endereco !== "string" || !dados.endereco.trim()) return "O endereço é obrigatório.";
    if (dados.endereco.trim().length > 100) return "O endereço deve ter no máximo 100 caracteres.";

    const telefone = String(dados.telefone ?? "").replace(/\D/g, "");
    if (!telefone) return "O telefone é obrigatório.";
    if (telefone.length < 10 || telefone.length > 11) return "O telefone deve ter 10 ou 11 dígitos.";

    if (typeof dados.email !== "string" || !dados.email.trim()) return "O e-mail é obrigatório.";
    if (dados.email.trim().length > 120 || !emailValido(dados.email.trim())) {
        return "Informe um e-mail válido com no máximo 120 caracteres.";
    }

    const cpf = String(dados.cpf ?? "").replace(/\D/g, "");
    if (dados.cpf !== undefined && dados.cpf !== null && String(dados.cpf).trim() !== "" && !cpf) return "O CPF informado é inválido.";
    if (cpf && cpf.length !== 11) return "O CPF deve ter 11 dígitos.";

    return null;
}
