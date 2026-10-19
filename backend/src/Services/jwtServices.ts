import jwt from "jsonwebtoken";
import { RetornoPayload } from "../Tipos/retornoPayload";

export default function ValidarToken(token: string): RetornoPayload | null {
    try {
        const segredo = process.env.JWT_SECRET || "chave-de-desenvolvimento-troque-em-producao";
        const decoded = jwt.verify(token, segredo) as RetornoPayload;
        return {
            id: decoded.id,
            tipo: decoded.tipo,
            email: decoded.email,
            nome: decoded.nome
        };
    } catch {
        return null;
    }
}
