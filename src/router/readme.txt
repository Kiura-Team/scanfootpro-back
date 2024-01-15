En esta carpeta van los archivos de las rutas
Ejemplo de la creación de un archivo:
    user.route.ts => nombre del archivo
    Dentro del archivo user.route.ts:
        router.get("/", [exampleMiddlewares, ....], exampleService);