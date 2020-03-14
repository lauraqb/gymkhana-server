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
  console.log("entraa")
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
    createTables()
    insertSomeData()
  }
})

/**
 * Create Tables
 */
const createTables = () => {
  const query1 = `CREATE TABLE IF NOT EXISTS 
    games (
      id serial NOT NULL,
      name character varying(20) COLLATE pg_catalog."default",
      pin integer,
      background character varying(50),
      PRIMARY KEY (id)
    );`//partidas
    //nombre_partida VARCHAR(20) NOT NULL, 
 
  const query2 = `CREATE TABLE IF NOT EXISTS 
    teams (
      id serial NOT NULL,
      game_id integer,
      name character varying(50),
      key character varying(10),
      num_players integer,
      PRIMARY KEY (id),
      CONSTRAINT teams_games_fkey FOREIGN KEY (game_id)
          REFERENCES public.games (id) MATCH SIMPLE
          ON UPDATE CASCADE
          ON DELETE CASCADE
          NOT VALID
    );`//   partida_id VARCHAR(10) NOT NULL, 

    const query3 = `CREATE TABLE IF NOT EXISTS 
      players (
        id serial,
        team_id integer,
        game_id integer,
        name character(100),
        PRIMARY KEY (id),
        CONSTRAINT players_games_fkey FOREIGN KEY (game_id)
          REFERENCES public.games (id) MATCH SIMPLE
          ON UPDATE CASCADE
          ON DELETE CASCADE
          NOT VALID,
        CONSTRAINT players_teams_fkey FOREIGN KEY (team_id)
          REFERENCES public.teams (id) MATCH SIMPLE
          ON UPDATE CASCADE
          ON DELETE CASCADE
          NOT VALID
      );`//equipo VARCHAR(25) NOT NULL
    
    const query4 = `CREATE TABLE IF NOT EXISTS 
      challenges_completed (
        id serial NOT NULL,
        player_id integer,
        PRIMARY KEY (id),
        CONSTRAINT challenge_player UNIQUE (id, player_id),
        CONSTRAINT challenges_players FOREIGN KEY (player_id)
            REFERENCES public.players (id) MATCH SIMPLE
            ON UPDATE CASCADE
            ON DELETE CASCADE
            NOT VALID
      );`// prueba INT(5) NOT NULL, 

    client.query(query1, (err, res) => {
      console.log(err ? err.stack : "Table 'games' created") 
    })
    client.query(query2, (err, res) => {
      console.log(err ? err.stack : "Table 'teams' created") 
    })
    client.query(query3, (err, res) => {
      console.log(err ? err.stack : "Table 'players' created") 
    })
    client.query(query4, (err, res) => {
      console.log(err ? err.stack : "Table 'challenges_completed' created") 
    })

}

const insertSomeData = () => {
    client.query("INSERT INTO games(name, pin) VALUES ('Piratas', 1234);", (err, res) => {
      console.log(err ? err.stack : "Insert 'Piratas' game") 
    })
    client.query("SELECT id FROM games WHERE name='Piratas';", (err, res) => {
      console.log(err ? err.stack : "Select id 'Piratas'") 
      console.log(res) 
      const game_id = 1
      client.query("INSERT INTO teams(game_id, name, key) VALUES ("+game_id+", 'rojo', '123');", (err, res) => {
        console.log(err ? err.stack : "Insertado equipo rojo") 
      })
      //TODO averiguar como obtener el id para hacer los siguientes inserts
    })
}

// client.end(()=> {
//   console.log("END connection")
// })