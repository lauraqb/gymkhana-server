const port = 8000
var express = require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io')(server)

app.get("/", function(req, res) {
  res.status(200).send("Hola mundo")
})

let teamsData = []

//Funcion que detecta si es un nuevo equipo y, en ese caso, devuelve true
function isANewTeam(data) {
  let isANewTeam = true
  for (var key in teamsData) {
    if (key == data.team) isANewTeam = false
  }
  return isANewTeam
}

function hasTeamMoved(data) {
  let hasMoved = false
  if (teamsData[data.team].latitude != data.latitude)
    hasMoved = true
  if (teamsData[data.team].longitude != data.longitude)
    hasMoved = true
  return hasMoved
}

io.on('connection', function(socket) {
  socket.on("coordenadas", data => {
      const newTeam = isANewTeam(data) //booleano
      if (newTeam) {
        teamsData[data.team] = {
          latitude : data.latitude,
          longitude : data.longitude
        }
        console.log('El equipo '+data.team+' se ha conectado')
      }
      //si es un nuevo equipo o si las coordenadas han cambiado entonces las enviamos al centro de control
      if(newTeam || hasTeamMoved(data)) {
        console.log(data)
        socket.broadcast.emit("coordenadasFromServer", data)
      }
    }
  )
  socket.on("error", data => {
      console.log(data)
    }
  )
  socket.on("requestFromControlCenter", ()=> {
    console.log("El centro de Control está pidiendo las coordenadas")
    for (var key in teamsData) {
      var data = { 
        team: key,
        latitude : teamsData[key].latitude,
        longitude : teamsData[key].longitude
      }
      socket.broadcast.emit("coordenadasFromServer", data)
    }
    
  })
});


io.listen(port);
console.log('listening on port ', port);


// server.listen(port, () => {
//   console.log('We are live on port '+port);
// });


