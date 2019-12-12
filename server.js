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

let jugadoresData = []

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
  socket.on("requestCoordenadasFromCC", (callback) => {
    geoAcciones.mandarCoordendasDeTodosLosEquipos(socket, callback)
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
    var sql = "SELECT nombre FROM jugadores WHERE nombre ='"+nombreJugador+"'"
    console.log(sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("result: "+result.length)
      callback(result.length)
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

    mandarCoordenadas : (data, socket) => {
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
    mandarCoordendasDeTodosLosEquipos : (socket, callback) => {
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


io.listen(port);
console.log('listening on port ', port);


// server.listen(port, () => {
//   console.log('We are live on port '+port);
// });


