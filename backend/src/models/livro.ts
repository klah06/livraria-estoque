
import mongoose, { Schema, Document } from "mongoose";

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
}


const LivroSchema = new Schema<ILivro>(
{
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    ano_pub: { type: Number, required: true },
    classificacao: { type: Number, required: true },
    num_paginas: { type: Number, required: true },
    estoque: { type: Number, required: true, default: 0, min: 0 },
    genero: { type: String, required: true },
    preco: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true, trim: true }
},
{ timestamps: true }
);

const Livro = mongoose.model<ILivro>("Livro", LivroSchema);

export default Livro;
