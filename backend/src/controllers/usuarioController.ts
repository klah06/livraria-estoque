
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuario";

// Cadastro realizado pelo administrador
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

        const identificadorNormalizado = String(identificador).trim().toLowerCase();

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

// Cadastro de funcionário autorizado pela senha do administrador
export const cadastrarFuncionario = async (req: Request, res: Response) => {
    try {
        const { nome, identificador, senha, senhaAdministrador } = req.body;

        if (!nome || !identificador || !senha || !senhaAdministrador) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        if (String(senha).length < 8) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 8 caracteres."
            });
        }

        const identificadorNormalizado = String(identificador).trim().toLowerCase();

        const usuarioExistente = await Usuario.findOne({
            identificador: identificadorNormalizado
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensagem: "Esse identificador já está cadastrado."
            });
        }

        const administradores = await Usuario.find({
            cargo: "administrador",
            ativo: true
        });

        let autorizado = false;

        for (const administrador of administradores) {
            const senhaCorreta = await bcrypt.compare(
                String(senhaAdministrador),
                administrador.senhaHash
            );

            if (senhaCorreta) {
                autorizado = true;
                break;
            }
        }

        if (!autorizado) {
            return res.status(403).json({
                mensagem: "Senha do administrador incorreta. Cadastro não autorizado."
            });
        }

        const senhaHash = await bcrypt.hash(String(senha), 12);

        const novoFuncionario = await Usuario.create({
            nome: String(nome).trim(),
            identificador: identificadorNormalizado,
            senhaHash,
            cargo: "funcionario",
            ativo: true
        });

        return res.status(201).json({
            mensagem: "Conta de funcionário criada com sucesso!",
            usuario: {
                id: novoFuncionario._id.toString(),
                nome: novoFuncionario.nome,
                identificador: novoFuncionario.identificador,
                cargo: novoFuncionario.cargo
            }
        });

    } catch (erro) {
        console.error("Erro ao cadastrar funcionário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar funcionário."
        });
    }
};

// Criação do primeiro administrador
export const criarPrimeiroAdministrador = async (req: Request, res: Response) => {
    try {
        const administradorExistente = await Usuario.findOne({
            cargo: "administrador"
        });

        if (administradorExistente) {
            return res.status(403).json({
                mensagem: "Já existe um administrador cadastrado."
            });
        }

        const { nome, identificador, senha } = req.body;

        if (!nome || !identificador || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        if (String(senha).length < 8) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 8 caracteres."
            });
        }

        const identificadorNormalizado = String(identificador).trim().toLowerCase();

        const usuarioExistente = await Usuario.findOne({
            identificador: identificadorNormalizado
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensagem: "Esse identificador já está cadastrado."
            });
        }

        const senhaHash = await bcrypt.hash(String(senha), 12);

        const novoAdministrador = await Usuario.create({
            nome: String(nome).trim(),
            identificador: identificadorNormalizado,
            senhaHash,
            cargo: "administrador",
            ativo: true
        });

        return res.status(201).json({
            mensagem: "Administrador criado com sucesso!",
            usuario: {
                id: novoAdministrador._id.toString(),
                nome: novoAdministrador.nome,
                identificador: novoAdministrador.identificador,
                cargo: novoAdministrador.cargo
            }
        });

    } catch (erro) {
        console.error("Erro ao criar administrador:", erro);

        return res.status(500).json({
            mensagem: "Erro ao criar administrador."
        });
    }
};
