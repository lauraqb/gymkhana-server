const dotenv = require('dotenv');
dotenv.config();

var mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASSWORD,
});

con.connect(function(err) {
  if (err) throw err
  console.log("Connected!")
  const dbName = "gymkhana"
  con.query("DROP DATABASE IF EXISTS "+dbName, function (err, result) {
    if (err) throw err;
    console.log("Database "+dbName+" deleted");
    con.query("CREATE DATABASE IF NOT EXISTS "+dbName, function (err, result) {
        if (err) throw err;
        console.log("Database "+dbName+" created");
        createTables(dbName)
      })
  })
});

createTables = (dbName)=> {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_DB_HOST,
        user: process.env.MYSQL_DB_USER,
        password: process.env.MYSQL_DB_PASSWORD,
        database: dbName
      });

    //"partidas"
    var sql = "CREATE TABLE partidas (id INT(5) PRIMARY KEY AUTO_INCREMENT, nombre_partida VARCHAR(20) NOT NULL, pin VARCHAR(10) NOT NULL)";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabla 'partidas' creada");
    });

    //"equipos"
    var sql = "CREATE TABLE equipos (id INT(5) PRIMARY KEY, partida_id VARCHAR(10) NOT NULL, nombre_equipo VARCHAR(10) NOT NULL, clave VARCHAR(10))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabla 'equipos' creada");
    });
  
    //"jugadores"
    var sql = "CREATE TABLE jugadores (nombre_jugador VARCHAR(25) PRIMARY KEY, equipo VARCHAR(25) NOT NULL)";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabla 'jugadores' creada");
    });

    //TODO cambiar a nombre_jugador
    var sql = "CREATE TABLE pruebas_x_jugador (prueba INT(5) NOT NULL, jugador VARCHAR(25) NOT NULL, equipo VARCHAR(25), completada BOOLEAN, CONSTRAINT UC_pruebaxjugador UNIQUE (prueba, jugador))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabla 'pruebas_x_jugador' creada");
    });

    connection.end(()=> {
      console.log("END connection")
    })

}