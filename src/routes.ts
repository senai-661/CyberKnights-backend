import express from "express";
import ClienteController from "./controller/ClienteController.js";
import PedidoController from "./controller/PedidoController.js";
import ProdutoController from "./controller/ProdutoController.js";
import { Auth } from "./middlewares/Auth.js";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({mensagem: "Aplicação online.",
        timestamp: `${new Date().toLocaleString('pt-br')}`});
});

router.post('/api/login', Auth.validacaoUsuario);

router.use(Auth.verifyToken);
router.get('/api/protegido', (req: Request, res: Response) => {
    res.send('Rota protegida');
});

router.get(`/api/cliente`, ClienteController.todos);
router.post(`/api/cliente`, ClienteController.novo);
router.get(`/api/cliente/:idCliente`, ClienteController.id);

router.get(`/api/pedido`, PedidoController.todos);
<<<<<<< HEAD
router.get(`/api/pedido/baratos`, PedidoController.listarPedidoBaixo);
router.get(`/api/pedido/completos`, PedidoController.listarPedidoCompleto); 
=======
router.get("/api/pedido/detalhado", PedidoController.detalhados);
>>>>>>> 37b08c0054bb16a52f1f4a04fcf4cb2958614fdf
router.get(`/api/pedido/:idPedido`, PedidoController.id);
router.post(`/api/pedido`, PedidoController.novo);

router.get(`/api/produto`, ProdutoController.todos);
router.post(`/api/produto`, ProdutoController.novo);
router.get(`/api/produto/:idProduto`, ProdutoController.id);




export { router };