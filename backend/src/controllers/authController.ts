
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/usuario";

export const realizarLogin = async (req: Request, res: Response) => {
    try {
        const corpo = req.body ?? {};
        const { identificador, senha } = corpo;

        // Verifica se os campos foram preenchidos
        if (!identificador || !senha) {
            return res.status(400).json({
                mensagem: "Informe o identificador e a senha."
            });
        }

        // Procura o usuário pelo identificador
        const usuario = await Usuario.findOne({
            identificador: String(identificador).trim().toLowerCase()
        });

        // Verifica se o usuário existe e está ativo
        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                mensagem: "Identificador ou senha inválidos."
            });
        }

        // Compara a senha informada com o hash armazenado
        const senhaCorreta = await bcrypt.compare(
            String(senha),
            usuario.senhaHash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "Identificador ou senha inválidos."
            });
        }

        // Verifica se a chave de autenticação está configurada
        const segredo = process.env.JWT_SECRET;

        if (!segredo) {
            return res.status(500).json({
                mensagem: "Configuração de autenticação indisponível."
            });
        }

        // Gera o token de acesso
        const token = jwt.sign(
            {
                id: usuario._id.toString(),
                cargo: usuario.cargo
            },
            segredo,
            {
                expiresIn: "8h"
            }
        );

        // Retorna os dados do usuário sem expor sua senha
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario._id.toString(),
                nome: usuario.nome,
                identificador: usuario.identificador,
                cargo: usuario.cargo
            }
        });

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao realizar login."
        });
    }
};
