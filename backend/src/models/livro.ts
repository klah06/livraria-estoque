
import mongoose, { Schema, Document } from "mongoose";

// HISTÓRICO DE MOVIMENTAÇÕES DO ESTOQUE
export interface IMovimentacao {
    usuarioId: string;
    nomeUsuario: string;
    tipo: "entrada" | "saida" | "ajuste";
    quantidadeAnterior: number;
    quantidadeNova: number;
    data: Date;
}

// INTERFACE DO LIVRO
export interface ILivro extends Document {
    title: string;
    author: string;
    ano_pub: number;
    classificacao: number;
    num_paginas: number;
    estoque: number;
    genero: string;
    preco: number;
    sku: string;
    historicoEstoque: IMovimentacao[];
}

// SCHEMA DO HISTÓRICO
const MovimentacaoSchema = new Schema<IMovimentacao>(
    {
        usuarioId: {
            type: String,
            required: true
        },
        nomeUsuario: {
            type: String,
            required: true
        },
        tipo: {
            type: String,
            enum: ["entrada", "saida", "ajuste"],
            required: true
        },
        quantidadeAnterior: {
            type: Number,
            required: true
        },
        quantidadeNova: {
            type: Number,
            required: true
        },
        data: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

// SCHEMA DO LIVRO
const LivroSchema = new Schema<ILivro>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: String,
            required: true,
            trim: true
        },
        ano_pub: {
            type: Number,
            required: true
        },
        classificacao: {
            type: Number,
            required: true
        },
        num_paginas: {
            type: Number,
            required: true
        },
        estoque: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        genero: {
            type: String,
            required: true
        },
        preco: {
            type: Number,
            required: true,
            min: 0
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        historicoEstoque: {
            type: [MovimentacaoSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

// CRIA O MODELO NO MONGODB
const Livro = mongoose.model<ILivro>("Livro", LivroSchema);

export default Livro;
