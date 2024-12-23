import { expect } from "chai";
import request from "supertest";
import sinon from "sinon";
import { createPool } from "mysql2/promise";
import createApp from "../src/index.js"; // Ajusta la ruta según tu estructura de proyecto

describe("createApp", () => {
  let app;
  let poolStub;

  before(() => {
    // Crear un stub para el pool de conexiones
    poolStub = sinon.stub();

    // Simular las funciones del pool de MySQL
    poolStub.query = sinon.stub().resolves([]);
    poolStub.end = sinon.stub().resolves();

    // Crear la aplicación con el stub
    app = createApp(poolStub);
  });

  after(() => {
    sinon.restore(); // Restaurar los stubs de Sinon
  });

  describe("GET /api/gases", () => {
    it("debería responder con un 200 y un arreglo vacío", async () => {
      const res = await request(app).get("/api/gases");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.length(0);
    });
  });

  describe("POST /api/gases", () => {
    it("debería crear un nuevo recurso y devolver un 201", async () => {
      // Simular la inserción en la base de datos
      poolStub.query.resolves([{ insertId: 1 }]);

      const payload = { nombre: "Gas Nuevo", propiedad: "Valor" };
      const res = await request(app).post("/api/gases").send(payload);

      expect(res.status).to.equal(201);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("id", 1);
    });
  });

  describe("PUT /api/gases/usuario", () => {
    it("debería actualizar un recurso existente y devolver un 200", async () => {
      // Simular la actualización en la base de datos
      poolStub.query.resolves([{ affectedRows: 1 }]);

      const id = 1;
      const payload = { propiedad: "Nuevo Valor" };
      const res = await request(app).put(`/api/gases/${id}`).send(payload);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("success", true);
    });
  });

  describe("Errores en rutas", () => {
    it("debería devolver un 404 para rutas no existentes", async () => {
      const res = await request(app).get("/api/inexistente");
      expect(res.status).to.equal(404);
    });
  });
});
