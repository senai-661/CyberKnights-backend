import express from "express";
import ClienteController from "./controller/ClienteController.js";
import PedidoController from "./controller/PedidoController.js";
import ProdutoController from "./controller/ProdutoController.js";

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({mensagem: "Aplicação online.",
        timestamp: `${new Date().toLocaleString('pt-br')}`});
});

router.get(`/api/cliente`, ClienteController.todos);
router.post("/api/cliente", ClienteController.novo);
router.get(`/api/cliente/:idCliente`, ClienteController.id);
router.get(`/api/pedido`, PedidoController.todos);
router.get(`/api/pedido/:idPedido`, PedidoController.id);
router.post(`/api/pedido`, PedidoController.novo);
router.get(`/api/produto`, ProdutoController.todos);
router.post(`/api/produto`, ProdutoController.novo);
router.get(`/api/produto/:idProduto`, ProdutoController.id);



export { router };