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
})


const geoAcciones = {
  sendCoordinates : (options, socket) => {
    console.log(time()+"sendCoordinates()")
    if (!options.playerId) return console.error("Error. El campo nombre tiene que estar definido")
    const data = {
      userid : options.userid,
      username : options.username,
      latitude : options.latitude.toFixed(4),
      longitude : options.longitude.toFixed(4),
    }
    console.log(data)
   _socket.broadcast.emit("coordenadasFromServer", data)
   //TODO guardar en cache
  },
}

io = io.listen(server)
server.listen(port, () => {
  console.log('We are live on port '+port);
})

