import { LoginBody, SignUpBody } from "./../interface/auth.interface";
import { Request, Response } from "express";
import { HelperBody } from "../helpers";
import { UserModel, VerificationCodeModel } from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Config from "../config";
import {
  capitalizeWord,
  generateVerificationCode,
} from "../utils/stringManager";
import db from "../db/connection";
import { randomNumber } from "../utils/numberManager";
import sendCustomEmail from "../utils/Email";
import { Model } from "sequelize";
import { UserModelI } from "../interface/user.interface";

//helpers
const { checkBody, validRegexBody } = HelperBody;
//Variables de entorno
const { secret, urlBack } = Config;

const signIn = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const check = checkBody(body, ["email", "password"]);
    if (check) {
      return res.status(400).json({ msg: check });
    }

    body.email = body.email.toLowerCase();

    const valid = validRegexBody(body, {
      email: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,6}$",
    });

    if (valid) {
      return res.status(400).json({ msg: valid });
    }

    const { email, password }: LoginBody = body;
    const user: any = await UserModel.findOne({
      where: { email, status: true },
    });

    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    //Comparamos la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(404).json({ msg: "Contraseña incorrecta" });

    //Comprobamos si el usuario ya verificó su perfil
    if (!user.email_verified)
      return res.status(400).json({ msg: "El usuario no está verificado" });

    //Creamos el token de inicio de sesion
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1d" });
    delete user.dataValues.password;
    delete user.dataValues.email_verified;
    delete user.dataValues.createdAt;

    res.json({ token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error interno" });
  }
};

const signUp = async (req: Request, res: Response) => {
  const transaction = await db.transaction();
  try {
    const body: SignUpBody = req.body;
    //Checkeamos el body recibido
    const check = checkBody(body, ["email", "password", "name"]);
    if (check) {
      return res.status(400).json({ msg: check });
    }

    body.email = body.email.toLowerCase();
    body.name = body.name.trim();
    body.name = capitalizeWord(body.name);

    //Validamos el formato del body
    const valid = validRegexBody(body, {
      email: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,6}$",
      password: "^(?=.{8,})(?=.*[A-Z])(?=.*[0-9])",
    });

    if (valid) {
      return res.status(400).json({ msg: valid });
    }

    //Validamos que el usuario no exista ya
    const { email, password, name } = body;
    const user = await UserModel.findOne({ where: { email } });

    if (user)
      return res.status(403).json({ msg: "Este correo ya está registrado" });

    //Creamos el hash para la contraseña
    body.password = await bcrypt.hash(password, 10);

    //Generamos un id aleatorio si la DB de usuarios está vacia
    const users: Array<any> = await UserModel.findAll();
    if (users.length === 0) body["id"] = randomNumber(4);

    //creamos el codigo de verificación
    const verificationCode = generateVerificationCode(40);
    const tokenVerificationCode = jwt.sign({ email, verificationCode }, secret);

    //Registramos el usuario
    const newUser: any = await UserModel.create({ ...body }, { transaction });

    //registramos el codigo de verificación
    await VerificationCodeModel.create(
      {
        user_id: newUser.id,
        code: verificationCode,
      },
      { transaction }
    );

    //enviamos correo de verificación
    await sendCustomEmail(
      "Activar cuenta",
      [email],
      "../../assets/emails/recoverEmail.html",
      {
        fullName: name,
        verifyLink: `${urlBack}/api/auth/verify_email?token=${tokenVerificationCode}`,
      }
    );

    await transaction.commit();
    res.json({
      msg: "¡Usuario registrado!, revise su correo electronico para validarlo.",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ msg: "Error interno" });
  }
};

export default { signIn, signUp };
