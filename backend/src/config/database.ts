// Importa o mongoose, responsável por conectar e trabalhar com o MongoDB
import mongoose from "mongoose";

// Importa o dotenv para acessar as variáveis de ambiente do arquivo .env
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

// Cria a função responsável por conectar ao banco de dados
const connectDB = async (): Promise<void> => {
    try {
        // Realiza a conexão utilizando a URL armazenada no arquivo .env
        await mongoose.connect(process.env.MONGO_URI as string);

        // Exibe uma mensagem no terminal quando a conexão é realizada
        console.log("MongoDB conectado com sucesso!");

    } catch (error) {
        // Exibe o erro caso a conexão com o banco falhe
        console.error("Erro ao conectar ao MongoDB:", error);

        // Encerra o processo do servidor caso não consiga conectar
        process.exit(1);
    }
};

// Exporta a função para ser utilizada no server.ts
export default connectDB;