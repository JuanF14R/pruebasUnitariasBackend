//1. Importamos dependencias, modulos y/o funciones
//Como vamos a probar peticiones importasmos el super test
import supertest from "supertest";
import { app } from "../app.js"; // Nos permite probar la conexión a base de datos, a rutas y poder probar los controllers, por eso ya no tenemos que importar el archivo del controllers aunque sea el que vamos a probar.
import mongoose from "mongoose";
import { productModel } from "../src/models/product.model.js";

describe('Pruebas de los contraloderes de productos', () =>{

    //A. Configuración global de las pruebas
    
      beforeEach(async () => {
        await productModel.deleteMany({}); // Nos vacía nuestra bas de datos para la realización de las pruebas
      });
    
      // Lo utilizamos para cerrar la conexión de la base de datos osea a mongoDB despues de todas las pruebas.
      afterAll(async () => {
        await mongoose.connection.close();
      });

      const testProduct = {
        image:"img1",
        name: "camisa1",
        category: "mujer",
        color: "Verde",
        talla: "M",
        price:"10000",
        stock: "2",
      }


 //B. Definimos bloque de prueba para cada petición.

  //PETICIÓN POST

  describe('Pruebas POST /productos/crear', () => {
    
    it('Debería crear un producto correctamente', async() => {
        const res = await supertest(app).post("/productos/crear").send(testProduct);
        expect(res.statusCode).toBe(201)
    });

    it('Deberia devolver error si falta un campo obligatorio', async () => {
        const res = await supertest(app).post("/productos/crear").send({talla: testProduct.talla});
        expect(res.statusCode).toBe(400);
    });

  });

  //PETICIÓN GET

  describe('Pruebas GET / productos/obtener', () => {

    it('Deberia indicar que no hay productos almacenados', async() => {
        const res = await supertest(app).get('/productos/obtener');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensaje', 'No se encontraron camisetas en la base de datos');
    });

    it('Debería mostrar los productos almacenados', async() => {
        await new productModel(testProduct).save();
        
        const res = await supertest(app).get('/productos/obtener');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('mensaje', 'Esto son todos las camisetas encontradas') 
    });
  });

  // PETICIÓN PUT

  describe('Pruebas PUT /productos/actualizar/:id', () => {

    it('Debería devolver error si no ingresa id del producto', async () => {

        const res = await supertest(app).put("/productos/actualizar/:id").send(testProduct);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('mensaje', "Ocurrio un error al actualizar la camiseta");
    });

    it('Debería actualizar el producto correctamente', async() => {

      const idProduct = await new productModel(testProduct).save();  
      

        const dataForUpdate = {
            image:"img2",
            name: "camisa2",
            category: "hombre",
            color: "Verde",
            talla: "M",
            price:"10000",
            stock: "2",
            id: '1234567891qwerty'
        };

        const res = await supertest(app).put("/productos/actualizar/" + idProduct.id).send(dataForUpdate);

        expect(res.statusCode).toBe(200);
        
    });

    it('Debería devolver error si ingresa un id valido pero que no existe en la base de datos', async () => {

        const productoCreado = await new productModel(testProduct).save();
        console.log(productoCreado._id);
        const idProduct = '673ffb2b5ea00ead048d0327';
        


        const res = await supertest(app).put("/productos/actualizar/" + idProduct).send(testProduct);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('mensaje', "Lo siento!!! No se encontró alguna camistea para actualizar");
    });
  });


  //PRUEBAS DELETE

  describe('Pruebas DELETE / productos/eliminar/:id', () => {

    it('Debería devolver error si no ingresa id', async () => {

        const res = await supertest(app).delete("/productos/eliminar/:id").send(testProduct);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('mensaje', "Ocurrio un error al eliminar la camiseta");
    });

    it('Debería devolver error si ingresa un id incorrecto', async () => {

        await new productModel(testProduct).save();


        const res = await supertest(app).delete("/productos/eliminar/:id").send(testProduct);
        expect(res.statusCode).toBe(400);

    });

    it('Debería eliminar exitosamente un producto', async () => {

        await new productModel(testProduct).save();


        const res = await supertest(app).delete("/productos/eliminar/:id").send({id:testProduct.id});
        expect(res.statusCode).toBe(400);

    });


  });

} );