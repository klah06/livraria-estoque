// Importa os tipos Request e Response do Express
import { Request, Response } from "express";

// Importa o modelo Livro, responsável pela comunicação com o MongoDB
import Livro from "../models/livro";

// LISTAR TODOS OS LIVROS
export const listarLivros = async (req: Request, res: Response) => {
    try {
        // Busca todos os livros cadastrados no banco de dados
        const livros = await Livro.find();

        // Retorna os livros encontrados com status 200 (sucesso)
        return res.status(200).json(livros);

    } catch (error) {
        // Caso aconteça algum erro, retorna status 500
        return res.status(500).json({
            mensagem: "Erro ao listar livros."
        });
    }
};

// BUSCAR UM LIVRO PELO ID
export const buscarLivro = async (req: Request, res: Response) => {
    try {
        // Busca um livro utilizando o ID recebido pela URL
        const livro = await Livro.findById(req.params.id);

        // Verifica se o livro existe
        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        // Retorna o livro encontrado
        return res.status(200).json(livro);

    } catch (error) {
        // Retorna erro caso a busca não seja realizada
        return res.status(500).json({
            mensagem: "Erro ao buscar livro."
        });
    }
};

// CADASTRAR UM NOVO LIVRO
export const cadastrarLivro = async (req: Request, res: Response) => {

    // Mostra no terminal os dados recebidos do frontend
    console.log("Cadastro recebido:", req.body);

    try {
        // Cria um novo livro utilizando os dados enviados na requisição
        const livro = await Livro.create(req.body);

        // Retorna o livro cadastrado com status 201 (criado)
        return res.status(201).json(livro);

    } catch (error) {
        // Mostra o erro completo no terminal para facilitar a identificação
        console.error("ERRO COMPLETO:", error);

        // Retorna uma mensagem caso o cadastro falhe
        return res.status(400).json({
            mensagem: "Erro ao cadastrar livro."
        });
    }
};

// ATUALIZAR UM LIVRO
export const atualizarLivro = async (req: Request, res: Response) => {
    try {
        // Procura o livro pelo ID e atualiza seus dados
        const livro = await Livro.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // Retorna o livro já atualizado
                runValidators: true // Verifica as validações do modelo
            }
        );

        // Verifica se o livro existe
        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        // Retorna o livro atualizado
        return res.status(200).json(livro);

    } catch (error) {
        // Retorna erro caso a atualização falhe
        return res.status(400).json({
            mensagem: "Erro ao atualizar livro."
        });
    }
};

// EXCLUIR UM LIVRO
export const excluirLivro = async (req: Request, res: Response) => {
    try {
        // Procura o livro pelo ID e remove do banco de dados
        const livro = await Livro.findByIdAndDelete(req.params.id);

        // Verifica se o livro existe
        if (!livro) {
            return res.status(404).json({
                mensagem: "Livro não encontrado."
            });
        }

        // Confirma que o livro foi excluído
        return res.status(200).json({
            mensagem: "Livro excluído com sucesso."
        });

    } catch (error) {
        // Retorna erro caso a exclusão falhe
        return res.status(500).json({
            mensagem: "Erro ao excluir livro."
        });
    }
};