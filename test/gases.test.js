import { expect } from "chai";
import request from "supertest";
import sinon from "sinon";
import createApp from "../src/index.js"; // Asegúrate de la ruta correcta al archivo de tu app

describe("Gases API", () => {
  let pool; // El pool simulado
  let app; // La aplicación Express
  let consoleErrorStub; // Agregado para manejar console.error

  before(() => {
    // Crear un mock para el pool
    pool = {
      query: sinon.stub() // Crear el pool como un objeto con `query` mockeado
    };

    // Crear la app usando el pool mockeado y un puerto diferente para las pruebas
    app = createApp(pool); // Pasa el pool simulado aquí y el puerto 3001

    consoleErrorStub = sinon.stub(console, 'error'); // Hacer un stub de console.error para silenciarlo
  });

  after(() => {
    // Restaurar el pool original y console.error después de los tests
    sinon.restore();
  });

  describe("GET /api/gases", () => {
    it("Debería obtener la lista de gases", async () => {
      // Simula el resultado de una consulta a la base de datos
      const mockGases = [
        { id: 1, gas: "CO2", valor: 300, hora: "2024-10-05T10:00:00Z", lugar: "CiudadX" },
      ];

      // Configura el stub para devolver los gases simulados
      pool.query.resolves([mockGases]);

      // Ejecuta la petición GET
      const res = await request(app).get("/api/gases");

      // Aserciones
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.deep.equal(mockGases);
    });
  });

  describe("POST /api/gases", () => {
    it("Debería insertar un nuevo gas", async () => {
      const gasData = {
        gas: "CO2",
        valor: 300,
        hora: "2024-10-05T10:00:00Z",
        lugar: "CiudadX",
      };

      // Simula el resultado de la inserción en la base de datos
      pool.query.resolves([{ insertId: 1 }]);

      // Ejecuta la petición POST
      const res = await request(app)
        .post("/api/gases")
        .send(gasData);

      // Aserciones
      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        id: 1,
        gas: gasData.gas,
        valor: gasData.valor,
        lugar: gasData.lugar,
      });
    });

    it("Debería manejar errores al insertar un gas", async () => {
      const gasData = {
        gas: null, // Enviando datos inválidos
        valor: 300,
        hora: "2024-10-05T10:00:00Z",
        lugar: "CiudadX",
      };

      // Simula un error de base de datos
      pool.query.rejects(new Error("Error en la base de datos"));

      const res = await request(app)
        .post("/api/gases")
        .send(gasData);

      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("error");
    });
    after(() => {
      consoleErrorStub.restore(); // Restaura console.error al final de las pruebas
    });
  });
});
