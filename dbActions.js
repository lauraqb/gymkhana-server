var DbActions = (connection) => {
  var getGameData = (pin, callback) => {
    if(typeof pin !== "string")
      return console.log("pin is a: "+typeof pin)
    var sql = "SELECT id, nombre_partida, pin FROM partidas WHERE pin ='"+pin+"'"
    console.log(sql)
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("getGameData: "+result.length)
        callback(result)
    });
  }

  const checkPlayerInDB = (nombreJugador, callback) => {
    if(typeof nombreJugador !== "string")
    return console.log("nombreJugador is a: "+typeof pin)
      var sql = "SELECT nombre_jugador FROM jugadores WHERE nombre_jugador ='"+nombreJugador+"'"
      console.log(sql)
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("result: "+result.length)
        callback(result)
      });
  }

  return {
    getGameData : getGameData,
    checkPlayerInDB : checkPlayerInDB
  }
}

module.exports = DbActions

// //Sockets entre la App (juego) y el servidor
// var PlayerEventHandler = (socket, connection) => {

//     // socket.on("validateGamePin", (data, callback) => {
//     //     dbActions.getGameData(data.pin, callback)
//     // })
//     socket.on("isPlayerInDB", (jugador, callback) => {
//         dbActions.checkPlayerInDB(jugador, callback)
//       })


//     var dbActions = {
//         getGameData : (pin, callback) => {
//             //TODO cambiar clave a pin
//             var sql = "SELECT id, nombre_partida, clave FROM partidas WHERE clave ='"+pin+"'"
//             console.log(sql)
//             connection.query(sql, function (err, result) {
//               if (err) throw err;
//               console.log("getGameData: "+result.length)
//                 callback(result)
//             });
//         },
//         /*Comprobamos que el usuario existe en la base de datos */
//         checkPlayerInDB : (nombreJugador, callback) => {
//             var sql = "SELECT nombre_jugador FROM jugadores WHERE nombre_jugador ='"+nombreJugador+"'"
//             console.log(sql)
//             connection.query(sql, function (err, result) {
//               if (err) throw err;
//               console.log("result: "+result.length)
//               callback(result.length)
//             });
//           },
//     }
// }

// module.exports = PlayerEventHandler