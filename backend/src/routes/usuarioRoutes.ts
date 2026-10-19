import { Router } from "express";
import {
    login, atualizarIptu, novoLogin, getIptuPorIdUsuario,
    getQRCodeOrCodBarras, getIptus, obterTokenCsrf, logout
} from "../controllers/usuarioController";
import { autenticar, somenteAdmin, validarTokenCsrf } from "../Services/seguranca";

const router = Router();

router.get("/csrf-token", obterTokenCsrf);
router.post("/login", validarTokenCsrf, login);
router.post("/novo-login", validarTokenCsrf, novoLogin);
router.post("/logout", validarTokenCsrf, logout);
router.post("/atualizar-iptu", autenticar, validarTokenCsrf, somenteAdmin, atualizarIptu);
router.get("/iptu-por-usuario", autenticar, getIptuPorIdUsuario);
router.get("/codigo-qr-ou-barra", autenticar, getQRCodeOrCodBarras);
router.get("/iptus", autenticar, somenteAdmin, getIptus);

export default router;
