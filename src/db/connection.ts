import { Sequelize } from "sequelize";
import Config from "../config";
const { nameDB, userDB, PasswordDB, hostDB, portDB } = Config;

const db = new Sequelize(nameDB, userDB, PasswordDB, {
  host: hostDB,
  dialect: "mysql",
  logging: false,
  port: +portDB,
  timezone: "-05:00",
});

//db.sync({ alter: false, force: false });
db.authenticate({ logging: true });

export default db;
