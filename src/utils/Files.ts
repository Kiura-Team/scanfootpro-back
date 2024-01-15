import path from "path";
import fs from "fs";
import { Crypt } from "./";
import { UploadedFile } from "express-fileupload";
const extensionesImage = ["png", "jpg", "jpeg", "gif"];
const extensionesDoc = ["pdf"];

export interface ResultGetFile {
  Base64: string;
  extension: string;
}

const existFolder = () => {
  if (!fs.existsSync(path.join(__dirname, "../../../private/profile"))) {
    fs.mkdirSync(path.join(__dirname, "../../../private/profile"), {
      recursive: true,
    });
  }
  if (!fs.existsSync(path.join(__dirname, "../../../tmp"))) {
    fs.mkdirSync(path.join(__dirname, "../../../tmp"), {
      recursive: true,
    });
  }
};

const salveFile = (
  file: UploadedFile,
  folder: string,
  id: number | string,
  type: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cutName = file.name.split(".");
    const extension = cutName[cutName.length - 1];

    switch (type) {
      case "image":
        if (!extensionesImage.includes(extension)) {
          return reject(
            `La extensión ${extension} del archivo ${file.name} no es permitidas - ${extensionesImage}`
          );
        }
        break;

      case "doc":
        if (!extensionesDoc.includes(extension)) {
          return reject(
            `La extensión ${extension} del archivo ${file.name} no es permitidas - ${extensionesDoc}`
          );
        }
        break;

      default:
        return reject(
          `La extensión ${extension} del archivo ${file.name} no es permitidas - ${extensionesDoc},${extensionesImage}`
        );
    }

    const nameTemp =
      Crypt.encrypt(`${file.name}-${id}-${file?.md5}`) + `.${extension}`;
    const uploadPath = path.join(
      __dirname,
      "../../../private/",
      folder,
      nameTemp
    );

    file.mv(uploadPath, (err) => {
      if (err) {
        return reject(err);
      }

      resolve(nameTemp);
    });
  });
};

const getFile = (rutaFile: string): Promise<ResultGetFile> => {
  return new Promise((resolve, reject) => {
    if (rutaFile.length === 0) {
      reject("Debe ingresar la ruta del archivo.");
    }
    const cutName = rutaFile.split(".");
    const extension = cutName[cutName.length - 1];
    const ruta = path.join(__dirname, "../../../private/", rutaFile);
    fs.readFile(ruta, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve({ Base64: data.toString("base64"), extension: extension });
    });
  });
};

const deleteFile = (rutaFile: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const ruta = path.join(__dirname, "../../../private/", rutaFile);
    fs.unlink(ruta, (err) => {
      if (err) {
        return reject(false);
      }
      return resolve(true);
    });
  });
};

export default { salveFile, getFile, deleteFile, existFolder };
