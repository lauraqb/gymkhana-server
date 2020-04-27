const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const port = 8000
const server = require('http').Server(app)
const routerGameApp = require('./src/gameApp/routes.js')
const routerCC = require('./src/controlCenter/routes.js')
const sockets = require('./src/sockets')

app.use(cors())
app.use(morgan('dev'))
app.use(express.urlencoded())
app.use(express.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")   //Para evitar CORS problem con el cliente
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(routerGameApp) 
app.use(routerCC) 

sockets.init(server)

server.listen(port, () => {
  console.log('We are live on port '+port)
})

