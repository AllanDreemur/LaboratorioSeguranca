import { Request, Response } from "express";
import db from "../database";
import xss from "xss";

export const criarComentario = async (req: Request, res: Response) => {
    const usuario = (req as any).usuario;
    const textoRecebido = req.body.texto;

    if (typeof textoRecebido !== "string" || !textoRecebido.trim()) {
        return res.status(400).json({ message: "Digite um comentário válido" });
    }

    // Sanitiza no back-end e usa parâmetros para impedir SQL Injection.
    const texto = xss(textoRecebido).slice(0, 255);

    try {
        await db.query(
            "INSERT INTO comentario (texto, usuario_id) VALUES ($1, $2)",
            [texto, usuario.id]
        );
        return res.status(201).json({ message: "Comentário criado" });
    } catch {
        return res.status(500).json({ error: "Erro ao criar comentário" });
    }
};

export const listarComentarios = async (_req: Request, res: Response) => {
    try {
        const result = await db.query("SELECT * FROM comentario ORDER BY id");
        res.json(result.rows);
    } catch {
        res.status(500).json({ error: "Erro ao listar comentários" });
    }
};
