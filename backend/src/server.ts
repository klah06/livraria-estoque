import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import livroRoutes from "./routes/livroRoutes";
import authRoutes from "./routes/authRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";

dotenv.config();

const app = express();

// Configurações e middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/livros", livroRoutes);
app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "API da Livraria funcionando!"
    });
});

const PORT = process.env.PORT || 3000;

// Inicia o servidor após conectar ao banco
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

startServer();
