const express = require('express')
const cors = require('cors')
const app = express()
const port = 8000
const server = require('http').Server(app)
var io = require('socket.io')(server)
const routerGameApp = require('./src/gameApp/routes.js')
const routerCC = require('./src/controlCenter/routes.js')
const socketMethods = require('./src/sockets.js')(io)

app.use(cors())
app.use(express.urlencoded())
app.use(express.json())
app.use(function(req, res, next) {
  //Para evitar CORS problem con el cliente:
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})
app.use(routerGameApp) 
app.use(routerCC) 

io = io.listen(server)
server.listen(port, () => {
  console.log('We are live on port '+port);
})

