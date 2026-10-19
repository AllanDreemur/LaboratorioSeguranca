import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ValidarToken from "./jwtServices";

const segredoJwt = process.env.JWT_SECRET || "chave-de-desenvolvimento-troque-em-producao";

export function gerarJwt(usuario: { id: number; tipo: number; email: string; nome: string }) {
    return jwt.sign(
        { id: usuario.id, tipo: usuario.tipo, email: usuario.email, nome: usuario.nome },
        segredoJwt,
        { expiresIn: "1h" }
    );
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Faça login para continuar" });

    const payload = ValidarToken(token);
    if (!payload) return res.status(401).json({ message: "Token inválido ou expirado" });

    (req as any).usuario = payload;
    next();
}

export function somenteAdmin(req: Request, res: Response, next: NextFunction) {
    if ((req as any).usuario?.tipo !== 1) {
        return res.status(403).json({ message: "Acesso permitido apenas ao administrador" });
    }
    next();
}

export function gerarTokenCsrf(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies?.csrfToken;
    if (!token) {
        token = crypto.randomBytes(32).toString("hex");
        res.cookie("csrfToken", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });
    }
    res.locals.csrfToken = token;
    next();
}

export function validarTokenCsrf(req: Request, res: Response, next: NextFunction) {
    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.get("X-CSRF-Token");
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ message: "Token anti-CSRF ausente ou inválido" });
    }
    next();
}
