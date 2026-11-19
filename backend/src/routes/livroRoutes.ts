import { Router } from "express";

import {
    listarLivros,
    buscarLivro,
    cadastrarLivro,
    atualizarLivro,
    excluirLivro
} from "../controllers/livroController";

import { atualizarEstoque } from "../controllers/estoqueController";

import {
    autenticar,
    exigirAdministrador
} from "../authMiddleware";

const router = Router();

// Todas as rotas exigem autenticação
router.use(autenticar);

// Consulta de livros: administrador e funcionário
router.get("/", listarLivros);
router.get("/:id", buscarLivro);

// Cadastro de livros: administrador e funcionário
router.post("/", cadastrarLivro);

// Atualização exclusiva do estoque
router.patch("/:id/estoque", atualizarEstoque);

// Edição completa: somente administrador
router.put("/:id", exigirAdministrador, atualizarLivro);

// Exclusão: somente administrador
router.delete("/:id", exigirAdministrador, excluirLivro);

export default router;