//1. Importamos dependencias, modulos y/o funciones
//Como vamos a probar peticiones importasmos el super test
import supertest from "supertest";
import { app } from "../app.js"; // Nos permite probar la conexión a base de datos, a rutas y poder probar los controllers, por eso ya no tenemos que importar el archivo del controllers aunque sea el que vamos a probar.
import mongoose from "mongoose";
import { userModel } from "../src/models/user.model.js";
import { usersRouter } from "../src/routes/user.routes.js";



describe('Pruebas de los controladores de los Usuarios', () => {

    //A. Configuración global de las pruebas
    
      beforeEach(async () => {
        await userModel.deleteMany({}); // Nos vacía nuestra bas de datos para la realización de las pruebas
      });
    
      // Lo utilizamos para cerrar la conexión de la base de datos osea a mongoDB despues de todas las pruebas.
      afterAll(async () => {
        await mongoose.connection.close();
      });


      const testUser = {
        fullName: 'Juan Rodriguez',
        email: 'Juan@prueba.com',
        password: '123'
      };

      //B. Definimos bloque de prueba para cada petición.

  //PETICIÓN POST

  describe('Pruebas POST /usuarios/crear', () => {

    it('Debería crear un usuario correctamente', async() =>{
        
        const res = await supertest(app).post("/usuarios/crear").send(testUser);

        expect(res.statusCode).toBe(201);
    });

    it('Deberia devolver un error si falta un campo obligatorio', async () => {
        const res = await supertest(app).post('/usuarios/crear').send({password: testUser.password});
        expect(res.statusCode).toBe(400);
    });

    it('Deberia devolver un error si repite el correo a registrar', async () => {
        await new userModel(testUser).save();

         const res = await supertest(app).post("/usuarios/crear").send({
              fullName: "Felipe",
              email: testUser.email,                  password: 1234,
        });
        
        expect(res.statusCode).toBe(400);
    });
  });

  //PETICION GET
  describe('Pruebas GET / usuarios/obtener', () => {

    it('Debería indicar que no hay usuarios almacenados', async() => {
        const res = await supertest(app).get('/usuarios/obtener');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensaje', "No hay usuarios almacenados");
        });

    it('Debería mostrar usuarios almacenados', async() => {

        await new userModel(testUser).save();

        const res = await supertest(app).get('/usuarios/obtener');
        // expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('mensaje', "Se encontraron usuarios almacenados");
            });
  });
});