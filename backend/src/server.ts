import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import livroRoutes from "./routes/livroRoutes";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use("/livros", livroRoutes);

app.get("/", (req, res) => {
    res.json({
    mensagem: "API da Livraria funcionando! "
    });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    });
};

startServer();
