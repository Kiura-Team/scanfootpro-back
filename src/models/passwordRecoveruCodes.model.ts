import { DataTypes } from "sequelize";
import db from "../db/connection";
import { UserModel } from ".";

const PasswordCodes = db.define("password_recovery_codes", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

PasswordCodes.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "users_codes",
});

export default PasswordCodes;
