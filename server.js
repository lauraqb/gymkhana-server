const express = require('express')
const router = express.Router()
var app = express();
const DbActions = require('./dbActions');
const port = 8000
var server = require('http').Server(app)
var io = require('socket.io')(server)
var mysql = require('mysql');
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
  }
})

app.use(express.urlencoded())
app.use(express.json())
app.use(function(req, res, next) {
  //Es para evitar CORS problem con el cliente
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(router) 

router.get("/", function(req, res) {
  console.log("hola desde get")
  res.send('hola desde get');
})

/** Retorna un objeto con 2 parámetros: 
 * - valid (que puede ser true or false)
 * - result */
router.post("/validateGame", (req, res)=> {
  const pin = req.body.pin
  DbActions(client).getGameData(pin, (response)=> {
    const data = {
      valid : response.length === 0 ? false : true,
      result : response.length === 0 ? null : response[0]
    }
    console.log("/validateGame: "+data)
    res.send(data)
  })
})

router.post("/joinUser", joinUser)
router.post("/joinTeam", joinTeam)

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
    console.log("Nombre duplicado")
    data.duplicated = true 
  }
  else { 
    let response2 = await DbActions(client).insertNewPlayer(options)
    if (response2.err) { console.log('error');}
    else { 
      console.log(response2)
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
    valid : false,
    result : null
  }

  if (!options.userId || !options.gameId || !options.userId) {
    // res.send(data.error)
    console.log(options)
    return
  }

  const response = await DbActions(client).validateTeamKey(options)
  
  if(response.length == 0) {
    console.log("Clave no existe")
  }
  else { 
    console.log("response ++++")
    console.log(response)
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


// router.post("/joinTeam", (req, res)=> {
//   const options = {
//     player: req.body.username,
//     game_id : req.body.game_id,
//     key: req.body.key
//   }
//   DbActions(client).joinTeam(options, (data)=> {
//     res.send(data)
//   })

// })


router.post("/checkPlayerInDB", function(req, res) {
  console.log("checkPlayerInDB:" +req.body.player)
  DbActions(connection).checkPlayerInDB(req.body.player, (data, callback)=> {
    res.send('checkPlayerInDB: '+data);
  })
})

let jugadoresData = []

io.on('connection', function(socket) {
  //const player = PlayerEventHandler(socket, connection);

  socket.on("nuevoJugador", data => {
    dbActions.insertNewPlayer(data)
  })
  socket.on("app/challengeDone", (data, callback)=> {
    console.log("socket on 'app/challengeDone': "+data)
    dbActions.challengeCompleted(data, callback, socket)
  })
  socket.on("eliminarJugadorFromCC", (data, callback) => {
    dbActions.deletePlayer(data, callback)
  })
  socket.on("coordenadas", data => {
    geoAcciones.sendCoordinates(data, socket)
  })
  socket.on("requestCoordenadasFromCC", (callback) => {
    geoAcciones.sendCoordinatesOfAllTeams(socket, callback)
  })
  socket.on("requestUserListFromCC", ()=> {
    sendAllPlayersData(socket)
  })
  socket.on("error", data => {
    console.log(data)
  })
  
  partidas(socket)

});



const sendAllPlayersData = (socket) => {
  var sql = "SELECT * FROM jugadores";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Select all from jugadores: ")
    console.log(result);
    socket.emit("usersList", result)
    return result
  });
};

const dbActions = {
  insertNewPlayer : (data) => {
    //TODO insert ignore - solo si no existe. Tambien hacer unique el nombre
    const nombre = data.jugador
    const equipo = data.equipo
    var sql = "INSERT IGNORE INTO jugadores (nombre_jugador, equipo) VALUES ('"+nombre+"', '"+equipo+"')";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record insert en 'jugadores' -> nombre: '"+nombre+"'");
    })
  },

  deletePlayer : (nombreJugador, callback) => {
    var sql = "DELETE FROM jugadores WHERE nombre_jugador = '"+nombreJugador+"'";
    console.log("sql: "+sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Jugador "+nombreJugador+" eliminado.");
      callback(true)
    });
  },

  challengeCompleted : (data, callback, socket) => {
    const prueba = data.pruebaId
    const jugador = data.nombre
    const equipo = data.team
    var sql = "INSERT IGNORE INTO pruebas_x_jugador (prueba, jugador, equipo) VALUES ('"+prueba+"', '"+jugador+"', '"+equipo+"')";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record insert en pruebas_x_jugador -> prueba: '"+prueba+"', jugador: '"+jugador+"'");
    });

    const numJugadores = {
      total : null,
      pruebaCompletada : null
    }
    dbActions.getJugadoresEquipo(equipo).then(function(jugadores) {
      dbActions.getJugadoresPruebaCompletada(prueba, equipo).then(function(jugadoresCompletados) {
        const jugadoresRestantes = jugadores-jugadoresCompletados
        console.log("Emitimos socket 'server/playersLeftToComplete' -> Prueba: "+prueba+" - jugadoresRestantes: "+jugadoresRestantes)
            //to emit to all sockets:
        io.sockets.emit('server/playersLeftToComplete', jugadoresRestantes);
     //   socket.emit("server/playersLeftToComplete", jugadoresRestantes)
        callback(jugadoresRestantes)
      })
    })
  },

  getJugadoresEquipo : (equipo) => {
    var sql = "SELECT * FROM jugadores WHERE equipo='"+equipo+"'";
    return new Promise(function(resolve, reject) {
      // Do async job
      connection.query(sql, function (err, result) {
        console.log("jugadores total: "+result.length);
        if (err) reject(err);
        else resolve(result.length);
      });
    })
  },
  getJugadoresPruebaCompletada : (prueba, equipo) => {
    var sql = "SELECT * FROM pruebas_x_jugador WHERE equipo='"+equipo+"' AND prueba='"+prueba+"'";
    return new Promise(function(resolve, reject) {
      // Do async job
      connection.query(sql, function (err, result) {
        console.log("jugadores que han completado: "+result.length);
        if (err) reject(err);
        else resolve(result.length);
      });
    })
  },

  getPartidas : (callback) => {
    var sql = "SELECT id, nombre_partida, clave FROM partidas"
    console.log(sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("result getPartidas: "+JSON.stringify(result, null, 4))
      callback(result)
    });
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

    sendCoordinates : (data, socket) => {
      if (!data.nombre) {
        console.log("Error. El campo nombre tiene que estar definido")
        return
      } 

      data.latitude = data.latitude.toFixed(4);
      data.longitude = data.longitude.toFixed(4);
      let jugadorNuevo = false
      if (!jugadoresData[data.nombre]) {
        jugadorNuevo = true
        geoAcciones.addJugadorNuevo(data)
      }

      const jugadorSeMueve = geoAcciones.checkJugadorEnMovimiento(data)
      //si es un nuevo equipo o si las coordenadas han cambiado entonces las enviamos al centro de control
      if(jugadorNuevo || jugadorSeMueve) {
        if (jugadorNuevo) console.log('El jugador '+data.nombre+' se ha conectado. Enviamos coordenadas.')
        if (jugadorSeMueve) console.log("El jugador: "+ data.nombre+" se mueve")
        
        socket.broadcast.emit("coordenadasFromServer", data)
      }
    },
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
  socket.on("requestPartidasFromCC", callback => {
    dbActions.getPartidas(callback)
  })
  socket.on("addNuevaPartida", data => {
    dbActions.addPartida(data)
  })
}


io = io.listen(server)
server.listen(port, () => {
  console.log('We are live on port '+port);
})


