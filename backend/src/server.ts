import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/usuarioRoutes";
import commentRoutes from "./routes/comentarioRoutes";
import hackerMalvadao from "./routes/hackerMalvadaoRoutes";
import { gerarTokenCsrf } from "./Services/seguranca";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(gerarTokenCsrf);

app.use("/usuario", userRoutes);
app.use("/comentario", commentRoutes);
app.use("/hacker-malvadao", hackerMalvadao);

app.listen(3001, () => {
    console.log("Servidor com medidas de segurança rodando na porta 3001");
});
