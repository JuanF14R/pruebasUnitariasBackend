//1. Importamos dependencias, modulos y/o funciones
//Como vamos a probar peticiones importasmos el super test
import supertest from "supertest";
import { app } from "../app.js"; // Nos permite probar la conexión a base de datos, a rutas y poder probar los controllers, por eso ya no tenemos que importar el archivo del controllers aunque sea el que vamos a probar.
import mongoose from "mongoose";
import { adminModel } from "../src/models/admin.model.js";

//2. Definir los bloques de prueba, para ello usamos el describe.

describe("Pruebas de los controladores de los administradores", () => {
  //A. Configuración global de las pruebas

  beforeEach(async () => {
    await adminModel.deleteMany({}); // Nos vacía nuestra bas de datos para la realización de las pruebas
  });

  // Lo utilizamos para cerrar la conexión de la base de datos osea a mongoDB despues de todas las pruebas.
  afterAll(async () => {
    await mongoose.connection.close();
  });

  const testAdmin = {
    name: "Juan Rodriguez",
    email: "Juan@prueba.com",
    password: "123",
    profileImage: "photo123",
  };

  //B. Definimos bloque de prueba para cada petición.

  //PETICIÓN POST

  describe("Pruebas POST /administradores/crear", () => {
    it("Debería crear un administrador correctamente", async () => {
      //Primero se revisa que funcione la ruta
      const res = await supertest(app).post("/administradores/crear").send(testAdmin);
      //Ante la revisión definimos que respuesta esperar:
      expect(res.statusCode).toBe(201);
    });

    it("Debeía devolver un error si falta un campo obligatorio", async () => {
      const res = await supertest(app).post("/administradores/crear").send({
        password: testAdmin.password
      });

      expect(res.statusCode).toBe(400);
    });

      //REVISAR ____________________________PRUEBA __________
      it("Debería devolver un error si repite el correo a registrar", async () => {

        await new adminModel(testAdmin).save();

        const res = await supertest(app).post("/administradores/crear").send({
          name: "Felipe",
          email: testAdmin.email,
          password: 1234,
        });

        expect(res.statusCode).toBe(400);
      });
    
  });

  //PETICIÓN GET

  describe('Pruebas GET / administradores/obtener', () => {


    it('Debería indicar que no hay administradores almacenados', async() => {
        const res = await supertest(app).get('/administradores/obtener');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensaje', "No hay administradores almacenados aún");
    })

    it('Debería mostrar los administradors almacenados', async() => {

        await new adminModel(testAdmin).save();

        const res = await supertest(app).get('/administradores/obtener');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensaje', 'Se encontraron administradores almacenados') 
    })
  })
});
