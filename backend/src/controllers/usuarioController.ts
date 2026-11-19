
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuario";

export const cadastrarUsuario = async (req: Request, res: Response) => {
    try {
        const { nome, identificador, senha, cargo } = req.body;

        if (!nome || !identificador || !senha || !cargo) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        if (!["administrador", "funcionario"].includes(cargo)) {
            return res.status(400).json({
                mensagem: "Cargo inválido."
            });
        }

        if (String(senha).length < 8) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 8 caracteres."
            });
        }

        const identificadorNormalizado = String(identificador)
            .trim()
            .toLowerCase();

        const usuarioExistente = await Usuario.findOne({
            identificador: identificadorNormalizado
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensagem: "Esse identificador já está cadastrado."
            });
        }

        const senhaHash = await bcrypt.hash(String(senha), 12);

        const novoUsuario = await Usuario.create({
            nome: String(nome).trim(),
            identificador: identificadorNormalizado,
            senhaHash,
            cargo
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id: novoUsuario._id.toString(),
                nome: novoUsuario.nome,
                identificador: novoUsuario.identificador,
                cargo: novoUsuario.cargo
            }
        });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
};
