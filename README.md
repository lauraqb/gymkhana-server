# gymkhana-server

## Para preparar la base de datos
node set-db.js
Solo hay que ejecutarlo una vez

## Para Ejecutar el servidor:
npm start
Crear archivo .env con las siguientes variables
POSTGRESQL_DB_HOST= mi endpoint
POSTGRESQL_DB_USER=
POSTGRESQL_DB_PASSWORD=

## Para ejecutar con Docker
docker build -t gymkhana-server-image .
docker run -p 8000:8000 -e POSTGRESQL_DB_HOST='foo' -e POSTGRESQL_DB_USER='foo' -e POSTGRESQL_DB_PASSWORD='bar' gymkhana-server-image 