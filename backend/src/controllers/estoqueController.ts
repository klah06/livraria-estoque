
import { Request, Response } from "express";
import Livro from "../models/livro";
import Usuario from "../models/usuario";

export const atualizarEstoque = async (req: Request, res: Response) => {
    try {
        const { quantidade } = req.body;

        // Valida a quantidade recebida
        if (
            typeof quantidade !== "number" ||
            !Number.isInteger(quantidade) ||
            quantidade < 0
        ) {
            return res.status(400).json({
                mensagem: "Informe uma quantidade inteira igual ou maior que zero."
            });
        }

        // Identifica o usuário autenticado
        const usuarioId = req.usuario?.id;

        if (!usuarioId) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado."
            });
        }

        const usuario = await Usuario.findById(usuarioId);

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                mensagem: "Usuário não encontrado ou inativo."
            });
        }

        // Busca o livro
        const livro = await Livro.findById(req.params.id);

        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        const quantidadeAnterior = livro.estoque;
        const quantidadeNova = quantidade;

        // Identifica o tipo de movimentação
        let tipo: "entrada" | "saida" | "ajuste";

        if (quantidadeNova > quantidadeAnterior) {
            tipo = "entrada";
        } else if (quantidadeNova < quantidadeAnterior) {
            tipo = "saida";
        } else {
            tipo = "ajuste";
        }

        // Atualiza o estoque e registra o responsável
        livro.estoque = quantidadeNova;

        livro.historicoEstoque.push({
            usuarioId: usuario._id.toString(),
            nomeUsuario: usuario.nome,
            tipo,
            quantidadeAnterior,
            quantidadeNova,
            data: new Date()
        });

        await livro.save();

        return res.status(200).json({
            mensagem: "Estoque atualizado com sucesso!",
            livro
        });

    } catch (erro) {
        console.error("Erro ao atualizar estoque:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar estoque."
        });
    }
};
