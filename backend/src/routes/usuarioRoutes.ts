
import { Router, Request, Response, NextFunction } from "express";

import {
    cadastrarUsuario,
    cadastrarFuncionario,
    criarPrimeiroAdministrador
} from "../controllers/usuarioController";

import {
    autenticar,
    exigirAdministrador
} from "../authMiddleware";

const router = Router();

// Proteção para criação do primeiro administrador
const protegerCriacaoInicial = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const chaveConfiguracao = process.env.ADMIN_SETUP_KEY;
    const chaveEnviada = req.header("x-admin-setup-key");

    if (!chaveConfiguracao || chaveEnviada !== chaveConfiguracao) {
        return res.status(403).json({
            mensagem: "Autorização para configuração inicial inválida."
        });
    }

    next();
};

// Criação do primeiro administrador
router.post(
    "/primeiro-administrador",
    protegerCriacaoInicial,
    criarPrimeiroAdministrador
);

// Cadastro de funcionários com autorização pela senha do administrador
router.post("/funcionario", cadastrarFuncionario);

// Cadastro de usuários realizado por administrador autenticado
router.post(
    "/",
    autenticar,
    exigirAdministrador,
    cadastrarUsuario
);

export default router;
