
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

// Lista os funcionários cadastrados (somente administrador)
export const listarFuncionarios = async (req: Request, res: Response) => {
    try {
        const funcionarios = await Usuario.find({
            cargo: "funcionario"
        }).select("-senhaHash");

        return res.status(200).json({
            funcionarios: funcionarios.map((funcionario) => ({
                id: funcionario._id.toString(),
                nome: funcionario.nome,
                identificador: funcionario.identificador,
                cargo: funcionario.cargo,
                ativo: funcionario.ativo
            }))
        });

    } catch (erro) {
        console.error("Erro ao listar funcionários:", erro);

        return res.status(500).json({
            mensagem: "Erro ao carregar funcionários."
        });
    }
};

// Edita os dados de um funcionário (somente administrador)

// Edita os dados de um funcionário (somente administrador)
export const editarFuncionario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, identificador, senha, ativo } = req.body;

        const funcionario = await Usuario.findById(id);

        if (!funcionario || funcionario.cargo !== "funcionario") {
            return res.status(404).json({
                mensagem: "Funcionário não encontrado."
            });
        }

        if (nome !== undefined) {
            if (!String(nome).trim()) {
                return res.status(400).json({
                    mensagem: "O nome não pode ficar vazio."
                });
            }

            funcionario.nome = String(nome).trim();
        }

        if (identificador !== undefined) {
            const identificadorNormalizado = String(identificador)
                .trim()
                .toLowerCase();

            if (!identificadorNormalizado) {
                return res.status(400).json({
                    mensagem: "O identificador não pode ficar vazio."
                });
            }

            const identificadorExistente = await Usuario.findOne({
                identificador: identificadorNormalizado,
                _id: { $ne: funcionario._id }
            });

            if (identificadorExistente) {
                return res.status(409).json({
                    mensagem: "Esse identificador já está cadastrado."
                });
            }

            funcionario.identificador = identificadorNormalizado;
        }

        if (senha !== undefined && String(senha).trim() !== "") {
            if (String(senha).length < 8) {
                return res.status(400).json({
                    mensagem: "A senha deve ter pelo menos 8 caracteres."
                });
            }

            funcionario.senhaHash = await bcrypt.hash(String(senha), 12);
        }

        if (ativo !== undefined) {
            funcionario.ativo = Boolean(ativo);
        }

        await funcionario.save();

        return res.status(200).json({
            mensagem: "Funcionário atualizado com sucesso!",
            funcionario: {
                id: funcionario._id.toString(),
                nome: funcionario.nome,
                identificador: funcionario.identificador,
                cargo: funcionario.cargo,
                ativo: funcionario.ativo
            }
        });

    } catch (erro) {
        console.error("Erro ao editar funcionário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar funcionário."
        });
    }
};
