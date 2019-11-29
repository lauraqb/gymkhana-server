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
    const con2 = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName
      });

    // var sql = "CREATE TABLE equipos (id INT(5), equipo VARCHAR(25))";
    // con2.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("Table equipos created");
    //     var sql = "INSERT INTO equipos (id, equipo) VALUES ?";
    //     var values = [
    //         [1, 'Rojo'],
    //         [2, 'Azul'],
    //         [3, 'Verde']
    //     ];
    //     con2.query(sql, [values], function (err, result) {
    //         if (err) throw err;
    //         console.log("Number of records inserted: " + result.affectedRows);
    //     });
    // });

    var sql = "CREATE TABLE pruebas_x_equipo (prueba INT(5), equipo VARCHAR(25), completada BOOLEAN)";
    con2.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table pruebas_x_equipo created");
    });


}