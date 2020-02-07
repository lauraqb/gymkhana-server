const dotenv = require('dotenv');
dotenv.config();

const { Client } = require('pg')

const client = new Client({
  host: process.env.POSTGRESQL_DB_HOST,
  user: process.env.POSTGRESQL_DB_USER,
  password: process.env.POSTGRESQL_DB_PASSWORD,
  database: 'gymkhana',
  port: 5432
})

client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
    createTables()
  }
})

/**
 * Create Tables
 */
const createTables = () => {
  const query1 = `CREATE TABLE IF NOT EXISTS 
    partidas (
      id integer NOT NULL,
      nombre character varying(100) 
      pin character varying(5) NOT NULL
    )`//nombre_partida VARCHAR(20) NOT NULL, 
 
    const query2 = `CREATE TABLE IF NOT EXISTS 
      teams (
        id integer NOT NULL,
        nombre character varying(100) 
        clave character varying(5) NOT NULL
      )`//   partida_id VARCHAR(10) NOT NULL, 

    const query3 = `CREATE TABLE IF NOT EXISTS 
      players (
        id integer NOT NULL DEFAULT nextval('players_id_seq'::regclass),
        nombre character varying(100) 
      )`//equipo VARCHAR(25) NOT NULL
    
    const query4 = `CREATE TABLE IF NOT EXISTS 
      pruebas_x_jugador (
        id integer NOT NULL,
        id_player integer, 
        id_team integer, 
        completada BOOLEAN, 
        CONSTRAINT UC_pruebaxjugador UNIQUE (prueba, jugador)
      )`// prueba INT(5) NOT NULL, 

      
    client.query(query1, (err, res) => {
      console.log(err ? err.stack : "Tabla 'partidas' creada") // Hello World!
    })
    client.query(query2, (err, res) => {
      console.log(err ? err.stack : "Tabla 'equipos' creada") // Hello World!
    })
    client.query(query3, (err, res) => {
      console.log(err ? err.stack : "Tabla 'jugadores' creada") // Hello World!
    })
    client.query(query4, (err, res) => {
      console.log(err ? err.stack : "Tabla 'pruebas_x_jugador' creada") // Hello World!
    })

    client.end(()=> {
      console.log("END connection")
    })
}
