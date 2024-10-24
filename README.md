
# AirChain:Backend

## Tabla de Contenidos

1. [Descripción](#descripción)
2. [Características](#características)
3. [Requisitos](#requisitos)
4. [Configuración y Ejecución](#configuración-y-ejecución)
5. [Créditos](#créditos)
6. [Licencia](#licencia)
7. [Repositorios relacionados](#repositorios)

## Descripción

Este proyecto proporciona una solución para medir la concentración de dióxido de carbono (CO2) y la temperatura en ambientes interiores utilizando sensores analógicos. Es útil para aplicaciones de monitoreo ambiental, sistemas de ventilación inteligente y para garantizar un entorno saludable en espacios cerrados.

La aplicación ofrece:
- **Gestión de datos de gases** mediante una **API RESTful**.
- Soporte para consultas y entradas en la base de datos.
- Middleware **CORS** para permitir acceso desde diferentes dominios.
- Servir archivos estáticos y JSON para facilitar la integración y visualización de datos.

## Características

- **API RESTful** para la gestión de datos de gases y otros parámetros ambientales.
- **Soporte para consultas MySQL** a la base de datos, facilitando la extracción de datos históricos.
- **Middleware CORS** para permitir el acceso seguro desde múltiples dominios.
- **Servir archivos JSON y estáticos** desde el servidor, ofreciendo una interfaz sencilla para el consumo de datos por otras aplicaciones.
- **Pruebas automáticas** con **Supertest** y **Sinon** para asegurar el correcto funcionamiento de la API.

## Requisitos

Para ejecutar este proyecto, necesitas:
- **Node.js** (>= 14.x)
- **MySQL**
- Las dependencias definidas en `package.json`

### Dependencias del Proyecto

En el archivo `package.json` encontrarás las siguientes dependencias clave:
- **Express**: Para crear la API y gestionar rutas.
- **MySQL**: Para la interacción con la base de datos.
- **Supertest**: Para realizar pruebas HTTP.
- **Sinon**: Para pruebas con mocks y stubs.


## Configuración y Ejecución

Sigue estos pasos para configurar y ejecutar el proyecto:

1. **Clonar este repositorio**:
   ```bash
   git clone https://github.com/Marvalencia04/AirChain-Backend
   cd biometria-web
   ```

2. **Instalar dependencias**:
   Asegúrate de tener `npm` instalado y ejecuta el siguiente comando para instalar todas las dependencias del proyecto:
   ```bash
   npm install
   ```

3. **Configurar el archivo `.env`**:
   Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

   ```bash
   MYSQLDB_HOST=localhost
   MYSQLDB_ROOT_PASSWORD=tu_contraseña
   MYSQLDB_PORT=3306
   MYSQLDB_DATABASE=tu_base_de_datos
   NODE_DOCKER_PORT=3000
   ```

   Asegúrate de reemplazar los valores con la configuración correspondiente a tu entorno.

4. **Ejecutar la aplicación**:
   Para iniciar la aplicación, utiliza el siguiente comando:
   ```bash
   npm start
   ```

   La aplicación se ejecutará en `http://localhost:3000` por defecto.

## Pruebas

El proyecto incluye un conjunto de pruebas para verificar la correcta funcionalidad de la API. Para ejecutar las pruebas, usa el siguiente comando:

```bash
npm test
```

Las pruebas utilizan **Supertest** para simular solicitudes HTTP y **Sinon** para crear mocks y stubs de las dependencias.

## Créditos

Este proyecto ha sido desarrollado por el equipo de **Biometría Web**.

## Licencia

Este proyecto está licenciado bajo la [MIT License]. Si utilizas este código, por favor da el crédito correspondiente.

## Repositorios relacionados
- [Airchain-Android](https://github.com/)
- [Airchain-Frontend](https://github.com/)
- [Airchain-Arduino](https://github.com/)

