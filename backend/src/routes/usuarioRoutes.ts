
import { Router, Request, Response, NextFunction } from "express";

import {
    cadastrarUsuario,
    cadastrarFuncionario,
    criarPrimeiroAdministrador,
    listarFuncionarios,
    editarFuncionario
} from "../controllers/usuarioController";

import {
    autenticar,
    exigirAdministrador
} from "../authMiddleware";

const router = Router();

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

router.post(
    "/primeiro-administrador",
    protegerCriacaoInicial,
    criarPrimeiroAdministrador
);

router.post("/funcionario", cadastrarFuncionario);

router.get(
    "/funcionarios",
    autenticar,
    exigirAdministrador,
    listarFuncionarios
);

router.put(
    "/funcionarios/:id",
    autenticar,
    exigirAdministrador,
    editarFuncionario
);

router.post(
    "/",
    autenticar,
    exigirAdministrador,
    cadastrarUsuario
);

export default router;
