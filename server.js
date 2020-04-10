const express = require('express')
var cors = require('cors')
var app = express()
const port = 8000
var server = require('http').Server(app)
var io = require('socket.io')(server)

app.use(cors())
app.use(express.urlencoded())
app.use(express.json())
app.use(function(req, res, next) {
  //Para evitar CORS problem con el cliente:
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
});
const routerGameApp = require('./src/gameApp/routes.js')
const routerCC = require('./src/controlCenter/routes.js')
app.use(routerGameApp) 
app.use(routerCC) 

const time = () => {
  let date_ob = new Date()
  let hours = date_ob.getHours()
  let minutes = date_ob.getMinutes()
  return "[" + hours + ":" + minutes + "] "
}
/********** */
let _socket = null
io.on('connection', function(socket) {
  console.log(time()+"socket on connection")
  _socket = socket
  socket.on("prueba", () => console.log("on socket prueba")  )
  socket.on("coordenadas", geoAcciones.sendCoordinates  )
  // socket.on("requestCoordenadasFromCC", (callback) => {
  //   geoAcciones.sendCoordinatesOfAllTeams(socket, callback)
  // })
})

let jugadoresData = []

const geoAcciones = {
  sendCoordinates : (options, socket) => {
    console.log(time()+"sendCoordinates()")
    if (!options.playerId) return console.error("Error. El campo nombre tiene que estar definido")
    const data = {
      playerId : options.playerId,
      latitude : options.latitude.toFixed(4),
      longitude : options.longitude.toFixed(4),
    }
    console.log(data)
   _socket.broadcast.emit("coordenadasFromServer", data)
  },
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

    

    sendCoordinates_bak : (options, socket) => {
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



io = io.listen(server)
server.listen(port, () => {
  console.log('We are live on port '+port);
})

