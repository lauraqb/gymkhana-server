/*** CONTROL CENTER */
const DbActions = require('./dbActions')
const client = require("../db")
const dba = DbActions(client)
const time = require('../utils/time')

exports.getGamesList = function (req, res) {
    console.log(time()+"CC/ getGamesList()")
    dba.getGamesList().then(response => res.send(response))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}
  
exports.getPlayers = function (req, res) {
    console.log(time()+"CC/ getPlayers()")
    dba.getPlayers(req.params.gameId).then(response =>  res.send(response))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}
  
exports.getTeams = function (req, res) {
    console.log(time()+"CC/ getTeams()")
    dba.getTeams(req.params.gameId).then(response => res.send(response))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}

exports.getGameDataWithId = function (req, res) {
    console.log("getGameDataWithId()")
    options = { gameId : req.params.gameId}
    dba.getGameWithId(options).then(response => res.send(response))
}

exports.insertNewTeam = function (req, res) {
    console.log("insertNewTeam()")
    options = { gameId : 
        req.params.gameId,
        teamName: req.body.teamName,
        teamKey : req.body.teamKey,
    }
    dba.insertNewTeam(options).then(response => res.send(response))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}

exports.updateGameChallenges = function (req, res) {
    console.log("updateGameChallenges")
    const options = {
      gameId : req.params.gameId,
      challenges :JSON.stringify(req.body)
    } 
    dba.updateGameChallenges(options, response => {
      res.send(response)
    })
}
  
exports.deletePlayer = function (req, res) {
    const playerId = req.params.playerId
    dba.deletePlayer(playerId).then( response => res.send(response))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}

//TODO: revisar
exports.addNewGame = function (req, res) {
    const data = req.params
    const nombrePartida = data.nombrePartida
    const clave = data.clave
    var sql = "INSERT IGNORE INTO partidas (nombre_partida, clave) VALUES ('"+nombrePartida+"', '"+clave+"')";
    console.log(sql)
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record insert en partidas -> nombrePartida: '"+nombrePartida+"'")
    })
}

exports.getAllCoordinates = function (req, res) {
    //obtener las coordenadas de un cache en jugadoresData
    console.log("El Centro de Control pide las coordenadas.")
    const jugadoresData = null //esto tiene que ser igual al cache
    if(!jugadoresData || jugadoresData.length ) {
        res.send(null)
    }
    else {
        console.log(jugadoresData)
        let myArray = []
        for (var key in jugadoresData) {
          var data = { 
            jugador: key,
            equipo: jugadoresData[key].equipo,
            latitude : jugadoresData[key].latitude,
            longitude : jugadoresData[key].longitude
          }
          myArray.push(data)
        }
        //const allData = JSON.stringify(myArray)
        res.send(myArray)
    }
}