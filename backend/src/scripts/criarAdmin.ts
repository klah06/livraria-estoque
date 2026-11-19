
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/database";
import Usuario from "../models/usuario";

dotenv.config();

const criarAdmin = async () => {
    try {
        const nome = process.env.ADMIN_NOME;
        const identificador = process.env.ADMIN_IDENTIFICADOR;
        const senha = process.env.ADMIN_SENHA;

        if (!nome || !identificador || !senha) {
            throw new Error(
                "Configure ADMIN_NOME, ADMIN_IDENTIFICADOR e ADMIN_SENHA no .env."
            );
        }

        if (senha.length < 8) {
            throw new Error("A senha deve ter pelo menos 8 caracteres.");
        }

        await connectDB();

        const adminExistente = await Usuario.findOne({
            cargo: "administrador"
        });

        if (adminExistente) {
            console.log("Já existe um administrador cadastrado.");
            return;
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        await Usuario.create({
            nome: nome.trim(),
            identificador: identificador.trim().toLowerCase(),
            senhaHash,
            cargo: "administrador",
            ativo: true
        });

        console.log("Administrador criado com sucesso!");

    } catch (erro) {
        console.error("Erro ao criar administrador:", erro);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

criarAdmin();
