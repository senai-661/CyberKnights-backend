import assert from "node:assert/strict";
import test from "node:test";
import {
    MENSAGEM_PEDIDO_MINIMO,
    MENSAGEM_PRODUTO_INDISPONIVEL,
    produtoDisponivel,
    statusDoPedido,
    validarCliente,
    validarPedidoBasico
} from "../src/validation/RegrasNegocio.ts";

test("bloqueia pedido abaixo de R$15,00", () => {
    assert.equal(validarPedidoBasico({
        idCliente: 1,
        idProduto: 1,
        quantidade: 1,
        dataPedido: "2026-09-25",
        valorTotal: 14.99,
        formaPagamento: "pix"
    }), MENSAGEM_PEDIDO_MINIMO);
});

test("aceita pedido com valor mínimo e forma de pagamento válida", () => {
    assert.equal(validarPedidoBasico({
        idCliente: 1,
        idProduto: 1,
        quantidade: 1,
        dataPedido: "2026-09-25",
        valorTotal: 15,
        formaPagamento: "pix"
    }), null);
});

test("reconhece disponibilidade com e sem acento", () => {
    assert.equal(produtoDisponivel("Disponível"), true);
    assert.equal(produtoDisponivel("disponivel"), true);
    assert.equal(produtoDisponivel("Indisponível"), false);
    assert.equal(MENSAGEM_PRODUTO_INDISPONIVEL, "Produto indisponível no momento. Por favor, escolha outro item do cardápio.");
});

test("status depende do pagamento", () => {
    assert.equal(statusDoPedido(true), "Em preparo");
    assert.equal(statusDoPedido(false), "Aguardando pagamento");
});

test("exige dados obrigatórios do cliente e aceita CPF opcional", () => {
    assert.equal(validarCliente({ nome: "Ana", endereco: "Rua A, 1", telefone: "11999999999" }), null);
    assert.equal(validarCliente({ nome: "Ana", endereco: "Rua A, 1", telefone: "11999999999", cpf: "123" }), "O CPF deve ter 11 dígitos.");
    assert.equal(validarCliente({ nome: "", endereco: "Rua A, 1", telefone: "11999999999" }), "O nome é obrigatório.");
});
