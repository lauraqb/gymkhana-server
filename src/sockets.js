const time = require('./utils/time')

var sockets = {}

const trace = (msg) => {

      //console.log(time()+msg)
  
}
sockets.init = function (server) {
  // socket.io setup
  var io = require('socket.io').listen(server)
  
  io.on('connection', function(socket) {

      console.log(time()+"socket on connection")

      socket.on("coordenadas", function(userdata) {
        trace("sendCoordinates()")
          if (!userdata.userid) return console.error("Error. El campo userid tiene que estar definido")
          const data = {
            userid : userdata.userid,
            username : userdata.username,
            latitude : userdata.latitude.toFixed(4),
            longitude : userdata.longitude.toFixed(4),
          }
          trace(data)
          socket.broadcast.emit("server/coordinates", data)
      })
  })

  io = io.listen(server)
}

module.exports = sockets
  