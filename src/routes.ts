interface IApiPaths {
  url: string;
  router: string;
}

export const ApiPaths: IApiPaths[] = [
  //Cuando creemos un archivo en la carpeta de router debemos crear nuestra ruta acá para que pueda ser accesible desde una petición
  //Ejemplo:  { url: "/example", router: "example.route" }
  //url: url del endpoint, router: nombre del archivo sin la extención del "ts"
];
