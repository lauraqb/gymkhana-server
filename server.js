const port = 8000
var express = require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io')(server)

app.get("/", function(req, res) {
  res.status(200).send("Hola mundo")
  console.log("Log: Hola mundo")
})

io.on('connection', function(socket) {
  socket.on("coordenadas", data => {
      console.log('Un equipo se ha conectado')
      console.log(data)
    }
  )
  socket.on("error", data => {
    console.log(data)
  }
)

});



server.listen(port, () => {
  console.log('We are live on port '+port);
});

// const wsServer = new webSocketServer({
//   httpServer: server
// })
// var socket = [];
// wsServer.on('request', function(request) {
//   console.log("Server on request")
//   const connection = request.accept(null, request.origin)
//   //This is the most important callback:
//   let msg= "nada"

//   connection.on('message', function(message) {
//     if (message.type === 'utf8') {
//       //process WebSocket message
//       socket.push(wsServer);
//       console.log(socket)
//       for(i = 0; i < socket.length; i++) {
//         socket[i].send(message);
//       }
//     }
    
//   })

//   connection.send(msg)
//   //connection.send("mensaje del servidor al cliente")
//   connection.on('close', function(connection) {
//     //close user connection
//   })
// })

