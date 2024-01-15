import express, { Application } from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import fs from "fs";
import https from "https";
import bodyParser from "body-parser";
import compression from "compression";
import db from "../db/connection";
import Config from "../config";
import { FilesController } from "../utils";
import { ApiPaths } from "../routes";
import morgan from "morgan";

class Server {
  private app: Application;
  private port: string | number;

  constructor() {
    this.app = express();
    this.port = Config.port || 3000;

    this.dbConnection();
    this.middleware();
    this.routes();
  }

  async dbConnection() {
    try {
      await db.authenticate();
      console.log("Database online");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  middleware() {
    // CORS
    this.app.use(cors());

    // Lectura y parseo del body
    this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(morgan("dev"));

    // Fileupload - Carga de archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "tmp",
        createParentPath: true,
      })
    );
  }
  /* eslint-disable @typescript-eslint/no-var-requires */
  routes() {
    console.log(ApiPaths);
    ApiPaths.forEach(({ url, router }) =>
      this.app.use(`/api${url}`, require(`../router/${router}`))
    );

    this.app.get("/", async (_, res) => {
      const html = await new Promise((resolve, reject) =>
        fs.readFile(
          `${__dirname}/../../../public/index.html`,
          { encoding: "utf-8" },
          (err, html) => {
            if (err) {
              return reject(err);
            }
            return resolve(html);
          }
        )
      );
      res.send(html);
    });
    this.app.use("*", express.static("public/index.html"));
  }

  listen() {
    FilesController.existFolder();
    if (Config.dev) {
      this.app.listen(this.port, () => {
        console.log("Servidor corriendo en el puerto", this.port);
      });
    } else {
      const privateKey = fs.readFileSync(
        `${Config.urlCertificado}privkey.pem`,
        "utf8"
      );
      const certificate = fs.readFileSync(
        `${Config.urlCertificado}cert.pem`,
        "utf8"
      );

      const credentials = {
        key: privateKey,
        cert: certificate,
      };
      const httpsServer = https.createServer(credentials, this.app);

      httpsServer.listen(Config.port, () => {
        console.log(`HTTPS Server running on port ${Config.port}`);
      });
    }
  }
}

export default Server;
