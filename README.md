# gymkhana-server



## Para correr el servidor:
- Normal:   `npm start`
    
- Con Docker
    ```
    docker build -t gymkhana-server-image .
    docker run -p 8000:8000 -e POSTGRESQL_DB_HOST='foo' -e POSTGRESQL_DB_USER='foo' -e POSTGRESQL_DB_PASSWORD='bar' gymkhana-server-image
    ```

## First time set up
### env
- Crear archivo .env con las siguientes variables y los datos de la base de datos
    ```
    POSTGRESQL_DB_HOST= mi endpoint
    POSTGRESQL_DB_USER=
    POSTGRESQL_DB_PASSWORD=
    ```

## Si no existe la base de datos:
Crear una base de datos postgres en AWS (Free Tier)
- nombre= "gymkhana" ?? se ha creado con el nombre de postgres...
- quitar Enable storage autoscaling
- Public access: Yes


## Set up para preparar la base de datos
- `node database_scripts/set-postgresql-db.js`

*Solo hay que ejecutarlo una vez