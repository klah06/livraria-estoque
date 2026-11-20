
import { Request, Response } from "express";
import Livro from "../models/livro";

// LISTAR TODOS OS LIVROS
export const listarLivros = async (req: Request, res: Response) => {
    try {
        const livros = await Livro.find();

        return res.status(200).json(livros);

    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao listar livros."
        });
    }
};

// BUSCAR UM LIVRO PELO ID
export const buscarLivro = async (req: Request, res: Response) => {
    try {
        const livro = await Livro.findById(req.params.id);

        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        return res.status(200).json(livro);

    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao buscar livro."
        });
    }
};

// CADASTRAR UM NOVO LIVRO
export const cadastrarLivro = async (req: Request, res: Response) => {
    try {
        const {
            title,
            author,
            ano_pub,
            classificacao,
            num_paginas,
            estoque,
            genero,
            preco,
            sku
        } = req.body;

        const livro = await Livro.create({
            title,
            author,
            ano_pub,
            classificacao,
            num_paginas,
            estoque,
            genero,
            preco,
            sku
        });

        return res.status(201).json(livro);

    } catch (error) {
        console.error("ERRO AO CADASTRAR:", error);

        return res.status(400).json({
            mensagem: "Erro ao cadastrar livro."
        });
    }
};

// ATUALIZAR UM LIVRO
export const atualizarLivro = async (req: Request, res: Response) => {
    try {
        const livro = await Livro.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        return res.status(200).json(livro);

    } catch (error) {
        return res.status(400).json({
            mensagem: "Erro ao atualizar livro."
        });
    }
};

// EXCLUIR UM LIVRO
export const excluirLivro = async (req: Request, res: Response) => {
    try {
        const livro = await Livro.findByIdAndDelete(req.params.id);

        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Livro excluído com sucesso."
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao excluir livro."
        });
    }
};
