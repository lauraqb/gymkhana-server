const dotenv = require('dotenv');
dotenv.config();

var mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName
      });

    var sql = "CREATE TABLE jugadores (nombre VARCHAR(25) PRIMARY KEY, equipo VARCHAR(25) NOT NULL)";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabla 'jugadores' creada");
    });

    var sql = "CREATE TABLE pruebas_x_jugador (prueba INT(5) NOT NULL, jugador VARCHAR(25) NOT NULL, equipo VARCHAR(25), completada BOOLEAN, CONSTRAINT UC_pruebaxjugador UNIQUE (prueba, jugador))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Tabla 'pruebas_x_jugador' creada");
    });

    connection.end(()=> {
      console.log("END connection")
    })

}