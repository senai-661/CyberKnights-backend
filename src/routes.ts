import express from "express";

import ClienteController from "./controller/ClienteController.js";
import PedidoController from "./controller/PedidoController.js";
import ProdutoController from "./controller/ProdutoController.js";
import { Auth } from "./middleware/Auth.js";

import type { Request, Response } from "express";

const router = express.Router();


// ==================== ROTA PRINCIPAL ====================

router.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        mensagem: "Aplicação online.",
        timestamp: new Date().toLocaleString("pt-BR")
    });
});


// ==================== LOGIN ====================

router.post("/api/login", Auth.validacaoUsuario);


// ==================== ROTAS PROTEGIDAS ====================

router.use(Auth.verifyToken);

router.get("/api/protegido", (req: Request, res: Response) => {
    res.send("Rota protegida");
});


// ==================== CLIENTE ====================

router.get("/api/cliente", ClienteController.todos);
router.post("/api/cliente", ClienteController.novo);
router.get("/api/cliente/:idCliente", ClienteController.id);
router.put("/api/cliente/:idCliente", ClienteController.atualizar);
router.delete("/api/cliente/:idCliente", ClienteController.remover);


// ==================== PEDIDO ====================

router.get("/api/pedido", PedidoController.todos);
router.get("/api/pedido/detalhado", PedidoController.detalhados);
router.get("/api/pedido/:idPedido", PedidoController.id);
router.post("/api/pedido", PedidoController.novo);


// ==================== PRODUTO ====================

router.get("/api/produto", ProdutoController.todos);
router.post("/api/produto", ProdutoController.novo);
router.get("/api/produto/:idProduto", ProdutoController.id);


export { router };