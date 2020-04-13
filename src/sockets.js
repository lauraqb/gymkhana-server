const time = () => {
    let date_ob = new Date()
    let hours = date_ob.getHours()
    let minutes = date_ob.getMinutes()
    return "[" + hours + ":" + minutes + "] "
  }
  

const mysockets = (io) => {
    console.log("hola")
    let _socket = null
    io.on('connection', function(socket) {
      console.log(time()+"socket on connection")
      _socket = socket
      //socket.on("prueba", () => console.log("on socket prueba")  )
      socket.on("coordenadas", geoAcciones.sendCoordinates  )
    })

    const geoAcciones = {
      sendCoordinates : (options, socket) => {
        console.log(time()+"sendCoordinates()")
        if (!options.userid) return console.error("Error. El campo nombre tiene que estar definido")
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
}

module.exports = mysockets
