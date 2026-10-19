import { Router } from "express";
import { recepcionarDadosRoubados } from "../controllers/hackerMalvadaoController";
import { autenticar, validarTokenCsrf } from "../Services/seguranca";

const router = Router();

router.post("/dados-roubados", autenticar, validarTokenCsrf, recepcionarDadosRoubados);

export default router;
