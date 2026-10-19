import { Request, Response } from "express";
import db from "../database";
import { gerarJwt } from "../Services/seguranca";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Parâmetros ($1 e $2) impedem que os valores sejam interpretados como SQL.
        const result = await db.query(
            "SELECT id, nome, email, tipo_usuario_id FROM usuario WHERE email = $1 AND senha = $2",
            [email, password]
        );

        if (result.rowCount && result.rowCount > 0) {
            const row = result.rows[0];
            const user = { id: row.id, nome: row.nome, email: row.email, tipo: row.tipo_usuario_id };
            const token = gerarJwt(user);

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 1000,
                path: "/"
            });

            return res.json({ success: true, user });
        }

        return res.status(401).json({ success: false, message: "Falha no login" });
    } catch {
        return res.status(500).json({ success: false, message: "Erro ao realizar login" });
    }
};

export const novoLogin = async (req: Request, res: Response) => {
    const { email, password, nome } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || typeof nome !== "string" ||
        !email.trim() || !password || !nome.trim()) {
        return res.status(400).json({ success: false, message: "Preencha nome, e-mail e senha" });
    }

    try {
        const iptuResult = await db.query("SELECT id FROM iptu WHERE nome = $1", [nome]);
        if (!iptuResult.rowCount) {
            return res.status(404).json({
                success: false,
                message: `Nome '${nome}' não encontrado no cadastro de municipes`
            });
        }

        const existente = await db.query("SELECT id FROM usuario WHERE email = $1", [email]);
        if (existente.rowCount) {
            return res.status(409).json({ success: false, message: "E-mail já cadastrado" });
        }

        const result = await db.query(
            "INSERT INTO usuario (email, senha, nome, tipo_usuario_id) VALUES ($1, $2, $3, 3) RETURNING id, nome, email, tipo_usuario_id",
            [email, password, nome]
        );
        const usuario = result.rows[0];

        await db.query("UPDATE iptu SET usuario_id = $1 WHERE nome = $2", [usuario.id, nome]);

        return res.json({
            success: true,
            user: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo_usuario_id }
        });
    } catch {
        return res.status(500).json({ success: false, message: "Erro ao cadastrar usuário" });
    }
};

export const atualizarIptu = async (req: Request, res: Response) => {
    const { usuarioId, novoValor } = req.body;
    if (!Number.isInteger(Number(usuarioId)) || !Number.isFinite(Number(novoValor)) || Number(novoValor) < 0) {
        return res.status(400).json({ message: "Usuário ou valor inválido" });
    }

    try {
        const result = await db.query(
            "UPDATE iptu SET valor = $1 WHERE usuario_id = $2",
            [Number(novoValor), Number(usuarioId)]
        );
        if (!result.rowCount) return res.status(404).json({ message: "IPTU não encontrado" });
        return res.json({ message: "IPTU atualizado" });
    } catch {
        return res.status(500).json({ error: "Erro ao atualizar IPTU" });
    }
};

export const getIptuPorIdUsuario = async (req: Request, res: Response) => {
    const usuario = (req as any).usuario;
    try {
        const result = await db.query("SELECT * FROM iptu WHERE usuario_id = $1", [usuario.id]);
        return res.json({ iptu: result.rows });
    } catch {
        return res.status(500).json({ error: "Erro ao buscar IPTU" });
    }
};

export const getIptus = async (_req: Request, res: Response) => {
    try {
        const result = await db.query("SELECT * FROM iptu");
        return res.json({ iptu: result.rows });
    } catch {
        return res.status(500).json({ error: "Erro ao buscar IPTUs" });
    }
};

export const getQRCodeOrCodBarras = async (req: Request, res: Response) => {
    const tipo = req.query.tipo as string;
    let codigoHtml = "";

    if (tipo === "codigoDeBarras") {
        codigoHtml = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=123456789" alt="Código de barras" />';
    } else if (tipo === "qrcode") {
        codigoHtml = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRCodeDemo" alt="QR Code" />';
    } else {
        return res.status(400).send("Tipo de código inválido");
    }

    // O parâmetro tipo é validado por lista permitida antes de compor a resposta HTML.
    res.json({ tipo, imagemUrl: tipo === "codigoDeBarras" ? "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=123456789" : "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRCodeDemo" });
};

export const obterTokenCsrf = (_req: Request, res: Response) => {
    res.json({ csrfToken: res.locals.csrfToken });
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict", path: "/" });
    res.json({ success: true });
};
