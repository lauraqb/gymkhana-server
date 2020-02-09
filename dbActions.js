var DbActions = (client) => {
  var getGameData = (pin, callback) => {
    if(!pin) {
      return console.log("PIN undefined")
    }
    if(typeof pin !== "string")
      return console.log("pin is a: "+typeof pin)
    var queryText = "SELECT id, name, pin FROM games WHERE pin ='"+pin+"'"
    console.log(queryText)
    client.query(queryText, (err, result) => {
      if (err) throw err
      const data = result.length === 0 ? "No existe" : result.rows[0]
      callback(data)
    })
  }

  const validateTeamKey = (options, cb) => {
    const queryText = "SELECT * FROM teams WHERE key ='"+options.key+"' AND game_id ='"+options.game_id+"'"
    console.log(queryText)
    client.query(queryText, (err, result) => {
      console.log(err ? err.stack : "Team Key validated") 
      if (err) throw err
      if (result.length === 0) {
        cb(false)
      }
      cb(result.rows[0])
    })
  }

  const joinTeam = (options, callback) => {
    if(!options.player || !options.key || !options.game_id) {
      return console.log("undefined data "+ options)
    }
    validateTeamKey(options, (data)=> {
      if(!data) {
        callback("wrong_key")
      }
      else {
        options.team_id = data.id
        options.team_name = data.name
        insertNewPlayer(options, (data)=> {
          if(data) callback(options.team_name)
        })
      }
    })
    // var queryText = "SELECT * FROM teams WHERE key ='"+options.key+"' AND game_id ='"+options.game_id+"'"
    // console.log(queryText)
    // client.query(queryText, (err, result) => {
    //   if (err) throw err
    //   if (result.length === 0) {
    //     callback("wrong_key")
    //   }
    //   else {
    //   }
    //   const data = result.rows
    //   callback(data)
    // })
  }

  const insertNewPlayer = (options, cb) => {
    const queryText = "INSERT INTO public.players(name, id_team) VALUES ('"+options.player+"', "+options.team_id+");"
    console.log(queryText)
    //TODO evitar que se dupliquen inserts
    client.query(queryText, (err, res) => {
      console.log(err ? err.stack : "Insertado jugador "+options.player)
      //todo devolver id del jugador insertado
      cb(true)
    })
  }

  const checkPlayerInDB = (nombreJugador, callback) => {
    if(typeof nombreJugador !== "string")
    return console.log("nombreJugador is a: "+typeof pin)
      var queryText = "SELECT nombre_jugador FROM jugadores WHERE nombre_jugador ='"+nombreJugador+"'"
      console.log(queryText)
      client.query(queryText, function (err, result) {
        if (err) throw err;
        console.log("result: "+result.length)
        callback(result)
      })
  }

  return {
    getGameData : getGameData,
    joinTeam : joinTeam,
    checkPlayerInDB : checkPlayerInDB
  }
}

module.exports = DbActions

// //Sockets entre la App (juego) y el servidor
// var PlayerEventHandler = (socket, client) => {

//     // socket.on("validateGamePin", (data, callback) => {
//     //     dbActions.getGameData(data.pin, callback)
//     // })
//     socket.on("isPlayerInDB", (jugador, callback) => {
//         dbActions.checkPlayerInDB(jugador, callback)
//       })


//     var dbActions = {
//         getGameData : (pin, callback) => {
//             //TODO cambiar clave a pin
//             var queryText = "SELECT id, nombre_partida, clave FROM partidas WHERE clave ='"+pin+"'"
//             console.log(queryText)
//             client.query(queryText, function (err, result) {
//               if (err) throw err;
//               console.log("getGameData: "+result.length)
//                 callback(result)
//             });
//         },
//         /*Comprobamos que el usuario existe en la base de datos */
//         checkPlayerInDB : (nombreJugador, callback) => {
//             var queryText = "SELECT nombre_jugador FROM jugadores WHERE nombre_jugador ='"+nombreJugador+"'"
//             console.log(queryText)
//             client.query(queryText, function (err, result) {
//               if (err) throw err;
//               console.log("result: "+result.length)
//               callback(result.length)
//             });
//           },
//     }
// }

// module.exports = PlayerEventHandler