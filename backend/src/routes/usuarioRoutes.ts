
import { Router } from "express";
import { cadastrarUsuario } from "../controllers/usuarioController";
import {
    autenticar,
    exigirAdministrador
} from "../authMiddleware";

const router = Router();

// Somente administradores autenticados podem cadastrar usuários
router.post(
    "/",
    autenticar,
    exigirAdministrador,
    cadastrarUsuario
);

export default router;
