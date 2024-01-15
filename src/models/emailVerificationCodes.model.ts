import { DataTypes } from "sequelize";
import db from "../db/connection";
import Users from "./users.model";

const EmailVerificationCodes = db.define("email_verification_codes", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default EmailVerificationCodes;
