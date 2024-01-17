import { Router } from "express";
import { AuthService } from "../services";

const router = Router();
//Servicios
const { signIn, signUp, verifyEmail } = AuthService;

//Rutas de autenticación
//Iniciar sesión
router.post("/signin", signIn);
//Registrarse
router.post("/signup", signUp);
//Verificar correo electronico
router.get("/verify_email", verifyEmail);

module.exports = router;
