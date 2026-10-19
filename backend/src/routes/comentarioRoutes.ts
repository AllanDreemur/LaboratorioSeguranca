import { Router } from "express";
import { criarComentario, listarComentarios } from "../controllers/comentarioController";
import { autenticar, validarTokenCsrf } from "../Services/seguranca";

const router = Router();

router.post("/", autenticar, validarTokenCsrf, criarComentario);
router.get("/", autenticar, listarComentarios);

export default router;
