import { Request, Response, Router } from "express";
import { AuthService } from "../services";

const router = Router();
//Servicios
const { signIn, signUp } = AuthService;

//Rutas de autenticación
//Iniciar sesión
router.post("/signin", signIn);
//Registrarse
router.post("/signup", signUp);

module.exports = router;
