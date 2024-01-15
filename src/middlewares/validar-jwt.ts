import { Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";
import Config from "../config";
import { SessionsModel } from "../models";
import db from "../db/connection";

const secret = Config.secret || "test";

const validarJWT = async (req: Request, res: Response, next: () => void) => {
  const token = req.headers["access-token"] || "";
  if (typeof token === "object") {
    return res.status(503).json({
      estado: false,
      msg: "Not provided token",
    });
  }

  if (token) {
    const session = await findOneActiveSession(token);
    verify(token, secret, async (err: VerifyErrors | null, decoded) => {
      if (err || !session) {
        if (session) {
          await disableSession(token);
        }
        console.log(err);
        return res.status(503).json({ estado: false, msg: "Invalid Token" });
      } else {
        if (typeof req.ip === "object") {
          return res.status(503).json({
            estado: false,
            msg: "Not provided ip",
          });
        }
        req.body["decoded"] = decoded;
        next();
      }
    });
  } else {
    res.status(503).json({
      estado: false,
      msg: "Not provided token",
    });
  }
};

const disableSession = async (token_sesion: string) => {
  const transaction = await db.transaction();
  try {
    await SessionsModel.update(
      { estado: false },
      { where: { token_sesion }, transaction }
    );
    transaction.commit();
  } catch (error) {
    console.log("Error al deshabilitar sesion", error);
    transaction.rollback();
  }
};

const findOneActiveSession = async (token_sesion: string) => {
  try {
    return await SessionsModel.findOne({
      where: {
        token_sesion,
        estado: true,
      },
    });
  } catch (error) {
    console.log("Error al consultar Session valida", error);
  }
};

export default { validarJWT };
