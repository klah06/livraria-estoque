
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DadosToken {
    id: string;
    cargo: "administrador" | "funcionario";
}

declare global {
    namespace Express {
        interface Request {
            usuario?: DadosToken;
        }
    }
}

export const autenticar = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cabecalho = req.headers.authorization;

        if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
            return res.status(401).json({
                mensagem: "Acesso não autorizado. Faça login."
            });
        }

        const token = cabecalho.split(" ")[1];
        const segredo = process.env.JWT_SECRET;

        if (!token || !segredo) {
            return res.status(401).json({
                mensagem: "Token inválido."
            });
        }

        const dados = jwt.verify(token, segredo) as DadosToken;

        req.usuario = dados;

        next();

    } catch (erro) {
        return res.status(401).json({
            mensagem: "Sessão inválida ou expirada. Faça login novamente."
        });
    }
};

export const exigirAdministrador = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.usuario?.cargo !== "administrador") {
        return res.status(403).json({
            mensagem: "Acesso permitido apenas para administradores."
        });
    }

    next();
};
