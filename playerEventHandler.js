
var PlayerEventHandler = (socket, connection) => {

    socket.on("validateGamePin", (data, callback) => {
        dbActions.getGameData(data.pin, callback)
    })


    var dbActions = {
        getGameData : (pin, callback) => {
            //TODO cambiar clave a pin
            var sql = "SELECT id, nombre_partida, clave FROM partidas WHERE clave ='"+pin+"'"
            console.log(sql)
            connection.query(sql, function (err, result) {
              if (err) throw err;
              console.log("getGameData: "+result.length)
                callback(result)
            });
        },
    }
}

module.exports = PlayerEventHandler