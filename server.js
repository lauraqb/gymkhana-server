const port = 8000
var express = require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io')(server)
var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "gymkhana"
});

// app.get("/", function(req, res) {
//   res.status(200).send("Hola mundo")
// })

let teamsData = []

io.on('connection', function(socket) {
  
  socket.on("checkJugadorFromApp", (jugador, callback) => {
    dbAcciones.checkJugadorExisteEnBD(jugador, callback)
  })
  socket.on("nuevoJugador", data => {
    dbAcciones.insertarNuevoJugador(data)
  })
  socket.on("pruebaCompletada", (data, callback)=> {
    console.log("socket on 'pruebaCompletada': "+data)
    dbAcciones.pruebaCompletada(data, callback, socket)
  })
  socket.on("eliminarJugadorFromCC", (data) => {
    dbAcciones.eliminarJugador(data)
  })
  socket.on("coordenadas", data => {
    geoAcciones.mandarCoordenadas(data, socket)
  })
  socket.on("requestCoordenadasFromCC", ()=> {
    geoAcciones.mandarCoordendasDeTodosLosEquipos(socket)
  })
  socket.on("requestUserListFromCC", ()=> {
    sendAllJugadores(socket)
  })
  socket.on("error", data => {
    console.log(data)
  })
  

});

const sendAllJugadores = (socket) => {
  var sql = "SELECT * FROM jugadores";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Select all from jugadores: ")
    console.log(result);
    socket.emit("usersList", result)
    return result
  });
};

const dbAcciones = {
  insertarNuevoJugador : (data) => {
    //TODO insert ignore - solo si no existe. Tambien hacer unique el nombre
    const nombre = data.jugador
    const equipo = data.equipo
    var sql = "INSERT IGNORE INTO jugadores (nombre, equipo) VALUES ('"+nombre+"', '"+equipo+"')";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record insert en 'jugadores' -> nombre: '"+nombre+"'");
    });
  },

  eliminarJugador : (nombreJugador) => {
    var sql = "DELETE FROM jugadores WHERE ('nombre' = '"+nombreJugador+"')";
    console.log("sql: "+sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Jugador "+nombreJugador+" eliminado.");
    });
  },

  pruebaCompletada : (data, callback, socket) => {
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
    dbAcciones.getJugadoresEquipo(equipo).then(function(jugadores) {
      dbAcciones.getJugadoresPruebaCompletada(prueba, equipo).then(function(jugadoresCompletados) {
        const jugadoresRestantes = jugadores-jugadoresCompletados
        console.log("Emitimos socket 'jugadoresRestantesFromServer' -> Prueba: "+prueba+" - jugadoresRestantes: "+jugadoresRestantes)
            //to emit to all sockets:
        io.sockets.emit('jugadoresRestantesFromServer', jugadoresRestantes);
     //   socket.emit("jugadoresRestantesFromServer", jugadoresRestantes)
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

  checkJugadorExisteEnBD : (nombreJugador, callback) => {
    var sql = "SELECT nombre FROM jugadores WHERE 'nombre' ='"+nombreJugador+"'"
    console.log(sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("result: "+result)
      callback(result.length)
    });
  }
}
const geoAcciones = {
//Funcion que detecta si es un nuevo equipo. En ese caso, devuelve true
    altaJugadorNuevo:(data) => {
      teamsData[data.nombre] = {
        latitude : data.latitude,
        longitude : data.longitude
      }
    },
    checkJugadorEnMovimiento : (data)  => {
      let hasMoved = false
      if (teamsData[data.nombre]) {
        if (teamsData[data.nombre].latitude != data.latitude) {
          teamsData[data.nombre].latitude = data.latitude
          hasMoved = true
        }
        if (teamsData[data.nombre].longitude != data.longitude) {
          teamsData[data.nombre].longitude = data.longitude
          hasMoved = true
        }
          
      }
      return hasMoved
    },

    mandarCoordenadas : (data, socket) => {
      if (!data.nombre) {
        console.log("Error. El campo nombre tiene que estar definido")
        return
      } 
      let jugadorNuevo = false
      if (!teamsData[data.nombre]) {
        jugadorNuevo = true
        geoAcciones.altaJugadorNuevo(data)
      }

      const equipoSeMueve = geoAcciones.checkJugadorEnMovimiento(data)
      //si es un nuevo equipo o si las coordenadas han cambiado entonces las enviamos al centro de control
      if(jugadorNuevo || equipoSeMueve) {
        if (jugadorNuevo) console.log('El jugador '+data.nombre+' se ha conectado. Enviamos coordenadas.')
        if (equipoSeMueve) console.log("El jugador: "+ data.nombre+" se mueve")
        
        socket.broadcast.emit("coordenadasFromServer", data)
      }
    },
    mandarCoordendasDeTodosLosEquipos : (socket) => {
      console.log("El Centro de Control está pidiendo las coordenadas")
      for (var key in teamsData) {
        var data = { 
          team: key,
          latitude : teamsData[key].latitude,
          longitude : teamsData[key].longitude
        }
        socket.broadcast.emit("coordenadasFromServer", data)
      }
    }
}


io.listen(port);
console.log('listening on port ', port);


// server.listen(port, () => {
//   console.log('We are live on port '+port);
// });


