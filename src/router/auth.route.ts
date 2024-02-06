import { Router } from "express";
import { AuthService } from "../services";

const router = Router();
//Servicios
const {
  signIn,
  signUp,
  verifyEmail,
  recoveryPassword,
  verifyCodePassword,
  changePassword,
} = AuthService;

//Rutas de autenticación
//Iniciar sesión
router.post("/signin", signIn);
//Registrarse
router.post("/signup", signUp);
//Verificar correo electronico
router.get("/verify_email", verifyEmail);
//Recuperar contraseña
router.post("/request_recovery", recoveryPassword); //Enviar codigo
router.post("/validate_code", verifyCodePassword); //Verificamos el codigo
router.put("/change_password", changePassword); //Cambiamos contreseña

module.exports = router;
