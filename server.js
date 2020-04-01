const express = require('express')
const router = express.Router()
var app = express();
const DbActions = require('./dbActions');
const port = 8000
var server = require('http').Server(app)
var io = require('socket.io')(server)
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
    console.log(time()+'connected')
  }
})

const time = () => {
  let date_ob = new Date();
  let hours = date_ob.getHours()
  let minutes = date_ob.getMinutes()
  //let seconds = date_ob.getSeconds()
  return "[" + hours + ":" + minutes + "] "
}

app.use(express.urlencoded())
app.use(express.json())
app.use(function(req, res, next) {
  //Es para evitar CORS problem con el cliente
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(router) 

//game app
router.get("/", (req, res) => res.send('hola'))
router.post("/validateGame", validateGame)
router.post("/joinUser", joinUser)
router.post("/joinTeam", joinTeam)
router.post("/checkPlayerInDB", checkPlayerInDB)
router.post("/challengeCompleted", challengeCompleted)

//control center
router.get("/games", getGamesData)
router.get("/games/:gameId/players/", getPlayers)
router.get("/games/:gameId/teams/", getTeams)
router.get("/games/:gameId/challenges/", getGameDataWithId)
router.put("/games/:gameId/updateChallenges/", updateGameChallenges)
router.get("/deletePlayer/:playerId", deletePlayer)

/** validateGame: Retorna un objeto con 2 parámetros: 
 * - valid (que puede ser true or false)
 * - result */
function validateGame (req, res) {
  const pin = req.body.pin
  DbActions(client).getGameData(pin, (response)=> {
    const data = {
      valid : response.length === 0 ? false : true,
      result : response.length === 0 ? null : response[0]
    }
    console.log(time()+"/validateGame")
    res.send(data)
  })
}


async function joinUser(req, res){
  const options = {
    username: req.body.username,
    game_id : req.body.game_id,
  }
  const data = {
    duplicated : false,
    result : null
  }

  let response = await DbActions(client).checkPlayerInDB(options)
  if(response.length > 0) {
    data.duplicated = true 
  }
  else { 
    let response2 = await DbActions(client).insertNewPlayer(options)
    if (response2.err) { console.log('error');}
    else { 
      data.result = response2 
    }
  }
  res.send(data)
}

async function joinTeam(req, res) {
  console.log("Join Team()")
  const options = {
    userId: req.body.userId,
    gameId : req.body.gameId,
    key: req.body.key,
    teamId: null
  }
  const data = {
    error: null,
    valid : false,
    result : null
  }
  if (!options.userId || !options.gameId || !options.key) {
    console.log(options)
    data.error = "Uno de los campos 'userId, gameId o key' es undefined"
    res.send(data)
    return
  }

  const response = await DbActions(client).validateTeamKey(options)
  if(response.length == 0) {
    data.valid = false
    console.log("Clave no existe")
  }
  else { 
    data.valid = true
    options.teamId = response[0].id
    const response2 = await DbActions(client).updateTeamPlayer(options)
    if (response2.err) { console.log('error');}
    else { 
      console.log(response2)
      data.result = response[0]
    }
  }
  res.send(data)
}

function checkPlayerInDB(req, res) {
  //TODO, lo necesito esto?
  // console.log("checkPlayerInDB:" +req.body.player)
  // DbActions(connection).checkPlayerInDB(req.body.player, (data, callback)=> {
  //   res.send('checkPlayerInDB: '+data);
  // })
}

async function challengeCompleted(req, res){
  const options = {
    callengeId: req.body.callengeId,
    userId : req.body.userId,
    teamId: req.body.teamId
  }
  if (!options.callengeId || !options.userId || !options.teamId ) {
    console.log("Error: Uno de los campos no está definido")
    console.log(options)
    res.send(null)
  }
  else {
    let response = await DbActions(client).insertChallengeCompleted(options)
    if (response.err) { console.log('error en insertChallengeCompleted: '+response.err); }

    io.sockets.emit('server/challengePassed', options);
  
    res.send(response)
  }
}

function getGamesData (req, res) {
  DbActions(client).getAllGames(response => {
    console.log("getGamesData: "+JSON.stringify(response, null, 4))
    res.send(response)
  })
}

function getPlayers (req, res) {
  const gameId = req.params.gameId
  DbActions(client).getPlayers(gameId, response =>  res.send(response))
}

function getTeams (req, res) {
  const gameId = req.params.gameId
  DbActions(client).getTeams(gameId, response => res.send(response))
}

function getGameDataWithId (req, res) {
  console.log("getGameDataWithId()")
  const gameId = req.params.gameId
  DbActions(client).getGameWithId(gameId, response => {
    // console.log("getGameData: "+JSON.stringify(response, null, 4))
    res.send(response)
  })
}

function updateGameChallenges (req, res) {
  console.log("updateGameChallenges")
  const options = {
    gameId : req.params.gameId,
    challenges :JSON.stringify(req.body)
  } 
  DbActions(client).updateGameChallenges(options, response => {
    console.log("getGameData: "+JSON.stringify(response, null, 4))
    res.send(response)
  })
}

function deletePlayer (req, res) {
  const playerId = req.params.playerId
  DbActions(client).deletePlayer(playerId, response => res.send(response))
}

let jugadoresData = []

io.on('connection', function(socket) {

  socket.on("coordenadas", data => {
    geoAcciones.sendCoordinates(data, socket)
  })
  socket.on("requestCoordenadasFromCC", (callback) => {
    geoAcciones.sendCoordinatesOfAllTeams(socket, callback)
  })
  
  partidas(socket)

})


const dbActions = {

  getJugadoresPruebaCompletada : (prueba, equipo) => {
    var sql = "SELECT * FROM pruebas_x_jugador WHERE equipo='"+equipo+"' AND prueba='"+prueba+"'";
    return new Promise(function(resolve, reject) {
      // Do async job
      connection.query(sql, function (err, result) {
        console.log("jugadores que han completado: "+result.length);
        if (err) reject(err);
        else resolve(result.length);
      })
    })
  },

  addPartida : (data) => {
    const nombrePartida = data.nombrePartida
    const clave = data.clave
    var sql = "INSERT IGNORE INTO partidas (nombre_partida, clave) VALUES ('"+nombrePartida+"', '"+clave+"')";
    console.log(sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record insert en partidas -> nombrePartida: '"+nombrePartida+"'")
      // callback(result)
    });
  }
}

const geoAcciones = {
//Funcion que detecta si es un nuevo equipo. En ese caso, devuelve true
    addJugadorNuevo:(data) => {
      console.log("añadimos jugador nuevo a jugadoresData.")
      jugadoresData[data.nombre] = {
        equipo: data.equipo,
        latitude : data.latitude,
        longitude : data.longitude
      }
    },
    checkJugadorEnMovimiento : (data)  => {
      let hasMoved = false
      if (jugadoresData[data.nombre]) {
        if (jugadoresData[data.nombre].latitude != data.latitude) {
          console.log("latitud de "+data.nombre+": "+jugadoresData[data.nombre].latitude +" = "+data.latitude)
          jugadoresData[data.nombre].latitude = data.latitude
          hasMoved = true
        }
        if (jugadoresData[data.nombre].longitude != data.longitude) {
          console.log("longitude de "+data.nombre+": "+jugadoresData[data.nombre].longitude +" = "+data.longitude)
          jugadoresData[data.nombre].longitude = data.longitude
          hasMoved = true
        }
          
      }
      return hasMoved
    },

    sendCoordinates : (options, socket) => {
      if (!options.playerId) return console.error("Error. El campo nombre tiene que estar definido")
      const data = {
        playerId : options.playerId,
        latitude : options.latitude.toFixed(4),
        longitude : options.longitude.toFixed(4),
      }
      console.log("sendCoordinates()")
      socket.broadcast.emit("coordenadasFromServer", data)
      return
      
      let jugadorNuevo = false
      if (!jugadoresData[options.nombre]) {
        jugadorNuevo = true
        geoAcciones.addJugadorNuevo(data)
      }

      const jugadorSeMueve = geoAcciones.checkJugadorEnMovimiento(data)
      //si es un nuevo equipo o si las coordenadas han cambiado entonces las enviamos al centro de control
      if(jugadorNuevo || jugadorSeMueve) {
        // if (jugadorNuevo) console.log('El jugador '+data.nombre+' se ha conectado. Enviamos coordenadas.')
        // if (jugadorSeMueve) console.log("El jugador: "+ data.nombre+" se mueve")
        
        socket.broadcast.emit("coordenadasFromServer", data)
      }
    },
    // sendCoordinates : (data, socket) => {
    //   if (!data.playerId) {
    //     console.log("Error. El campo nombre tiene que estar definido")
    //     return
    //   } 

    //   data.latitude = data.latitude.toFixed(4);
    //   data.longitude = data.longitude.toFixed(4);
    //   let jugadorNuevo = false
    //   if (!jugadoresData[data.nombre]) {
    //     jugadorNuevo = true
    //     geoAcciones.addJugadorNuevo(data)
    //   }

    //   const jugadorSeMueve = geoAcciones.checkJugadorEnMovimiento(data)
    //   //si es un nuevo equipo o si las coordenadas han cambiado entonces las enviamos al centro de control
    //   if(jugadorNuevo || jugadorSeMueve) {
    //     if (jugadorNuevo) console.log('El jugador '+data.nombre+' se ha conectado. Enviamos coordenadas.')
    //     if (jugadorSeMueve) console.log("El jugador: "+ data.nombre+" se mueve")
        
    //     socket.broadcast.emit("coordenadasFromServer", data)
    //   }
    // },
    sendCoordinatesOfAllTeams : (socket, callback) => {
      console.log("El Centro de Control está pidiendo las coordenadas. jugadoresData: ")
      console.log(jugadoresData)
      // callback(jugadoresData)
      let myArray = []
      for (var key in jugadoresData) {
        var data = { 
          jugador: key,
          equipo: jugadoresData[key].equipo,
          latitude : jugadoresData[key].latitude,
          longitude : jugadoresData[key].longitude
        }
        myArray.push(data)
        // console.log("Emitimos socket coordenadasFromServer")
        // socket.broadcast.emit("coordenadasFromServer", data)
      }
      console.log(myArray.length)
      if (myArray.length > 0) {
        const allData = JSON.stringify(myArray)
        callback(allData)
      }
    }
}

//sockets para la creación y gestión de partidas
const partidas = (socket) => {
  socket.on("addNuevaPartida", data => {
    dbActions.addPartida(data)
  })
}


io = io.listen(server)
server.listen(port, () => {
  console.log('We are live on port '+port);
})

