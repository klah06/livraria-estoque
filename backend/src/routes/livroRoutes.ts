// Importa o Router do Express para criar as rotas
import { Router } from "express";

// Importa as funções responsáveis pelas operações dos livros
import {
    listarLivros,
    buscarLivro,
    cadastrarLivro,
    atualizarLivro,
    excluirLivro
} from "../controllers/livroController";

// Cria uma instância do roteador
const router = Router();

// GET: lista todos os livros cadastrados
router.get("/", listarLivros);

// GET: busca um livro pelo ID
router.get("/:id", buscarLivro);

// POST: cadastra um novo livro
router.post("/", cadastrarLivro);

// PUT: atualiza os dados de um livro
router.put("/:id", atualizarLivro);

// DELETE: exclui um livro pelo ID
router.delete("/:id", excluirLivro);

// Exporta as rotas para serem utilizadas no server.ts
export default router;