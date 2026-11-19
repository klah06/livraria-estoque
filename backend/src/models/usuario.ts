
import mongoose, { Schema, Document } from "mongoose";

export interface IUsuario extends Document {
    nome: string;
    identificador: string;
    senhaHash: string;
    cargo: "administrador" | "funcionario";
    ativo: boolean;
}

const UsuarioSchema = new Schema<IUsuario>(
    {
        nome: {
            type: String,
            required: true,
            trim: true
        },

        identificador: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        senhaHash: {
            type: String,
            required: true
        },

        cargo: {
            type: String,
            enum: ["administrador", "funcionario"],
            default: "funcionario",
            required: true
        },

        ativo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Usuario = mongoose.model<IUsuario>("Usuario", UsuarioSchema);

export default Usuario;
