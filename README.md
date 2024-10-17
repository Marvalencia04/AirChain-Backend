# Biometria Web

## Descripción del Proyecto

Este proyecto proporciona una solución para medir la concentración de dióxido de carbono (CO2) y la temperatura en ambientes interiores utilizando sensores analógicos. 
Es útil para aplicaciones de monitoreo ambiental, sistemas de ventilación inteligente, y para garantizar un entorno saludable en espacios cerrados.

## Características

- **API RESTful** para gestionar datos de gases.
- Soporte para consultas y entradas a la base de datos.
- Middleware de CORS para permitir el acceso desde diferentes dominios.
- Servir archivos estáticos y JSON.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución de JavaScript del lado del servidor.
- **Express**: Framework para crear aplicaciones web y API.
- **MySQL**: Sistema de gestión de bases de datos relacional.
- **Supertest**: Biblioteca para realizar pruebas HTTP en Node.js.
- **Sinon**: Biblioteca para crear mocks y stubs en pruebas.

## Requisitos

- Node.js (>= 14.x)
- MySQL
- Dependencias definidas en `package.json`

## Configuración del Proyecto

1. Clonar el repositorio:

   git clone https://github.com/Marvalencia04/Biometria-Web
   cd biometria-web

2. Instalar las dependencias:

    Asegúrate de tener npm instalado y ejecuta el siguiente comando para instalar todas las dependencias del proyecto:

    npm install

3. Configurar el archivo .env:

Crea un archivo .env en la raíz del proyecto y añade las siguientes variables:

    MYSQLDB_HOST=localhost
    MYSQLDB_ROOT_PASSWORD=tu_contraseña
    MYSQLDB_PORT=3306
    MYSQLDB_DATABASE=tu_base_de_datos
    NODE_DOCKER_PORT=3000

    Asegúrate de reemplazar los valores con la configuración correspondiente a tu entorno.

4. Ejecutar la Aplicación

Para iniciar la aplicación, utiliza el siguiente comando:

npm start

La aplicación se ejecutará en http://localhost:3000 por defecto.
5. Ejecutar Tests

Para ejecutar los tests de la aplicación, utiliza el siguiente comando:

npm test

Esto ejecutará las pruebas definidas en el proyecto utilizando Mocha y Chai.