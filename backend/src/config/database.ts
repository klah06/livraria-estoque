
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI?.trim();

        if (
            !mongoUri?.startsWith("mongodb://") &&
            !mongoUri?.startsWith("mongodb+srv://")
        ) {
            throw new Error("MONGO_URI ausente ou com formato inválido.");
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB conectado com sucesso!");

    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;
