En esta carpeta agrega la logica de los endpoints que conocemos como los servicios.
Ejemplo:
    Creamos un arrow function y recibimos los parametros req y res con su debido tipado por parte de sequelize, si el tipo de endpoint requiere crear,
    actualizar o eliminar, creamos una transacción de sequelize para crear de forma segura, si hay un error se hace un rollback.
    const exampleService = async ( req: Request, res: Response ) => {
        const transaction = await sequelize.transaction(); //sequelize hace referencia a como exportemos la base de datos en su configuracion
        try{
            //Logica de el edpoint y sus posibles respuetas
            //en caso de que estemos creando, modificanco o eliminado en la base de datos en esas consultas le pasamos la transacció
            //Ej: 
            await MODELEXAMPLE.create({ body }, { where: { id: 1 } }, { transaction }); 
            //Una vez termine el endpoin, antes de enviar la respuesta correcta hacemos commit a la transaccion para que se haga efectivo el cambio en la DB
            //Ej:
            await transaction.commit();
        }catch (e) {
            //si tenemos una transaccion activa y por algun motivo hay error le hacemos un rollback para que no se creen registros
            //Ej:
            await transaction.rollback();
            res.status(500).json({msg: "Error interno"})
        }
    }

    Las respuestas (res) las manejamos por status y seguido de eso le pasamos un json por ejemplo: 
        res.status(400).json({msg: "Error en la request"})
        res.status(200).json({msg: "¡Registro exitoso!"})