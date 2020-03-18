var DbActions = (client) => {
  var getGameData = (pin, callback) => {
    if(!pin || typeof pin !== "string") {
      return console.log("PIN incorrecto")
    }
    var queryText = "SELECT id, name, pin FROM games WHERE pin ='"+pin+"'"
    console.log(queryText)
    client.query(queryText, (err, result) => {
      if (err) throw err
      const data = result.rows
      callback(data)
    })
  }
  
  /*** Join User */
  const checkPlayerInDB = (options) => {
    return new Promise(resolve => { 
      const username = options.username
      const gameId = options.game_id
      if(typeof username !== "string") return console.log("nombreJugador is a: "+typeof pin)
      var queryText = "SELECT name FROM players WHERE name ='"+username+"' AND game_id='"+gameId+"'"
      console.log(queryText)
      client.query(queryText, function (err, result) {
        if (err) throw err;
        resolve(result.rows) 
      })
    })
  }

  const insertNewPlayer = (options) => {
    return new Promise(resolve => { 
      const queryText = "INSERT INTO public.players(name, game_id) VALUES ('"+options.username+"', "+options.game_id+") RETURNING *;"
      console.log(queryText)
      client.query(queryText, (err, result) => {
        console.log(err ? err.stack : "Insertado jugador "+options.username)
        resolve(result.rows[0])
      })
    })
  }

  /** Join Team */
  const validateTeamKey = (options) => {
    return new Promise(resolve => { 
      const key = options.key
      const gameId = options.gameId
        const queryText = "SELECT * FROM teams WHERE key ='"+key+"' AND game_id ='"+gameId+"'"
        console.log(queryText)
        client.query(queryText, function (err, result) {
          if (err) throw err;
          resolve(result.rows) 
        })
    })
  }

  const updateTeamPlayer = (options) => {
    return new Promise((resolve, reject) => { 
      const teamId = options.teamId
      const userId = options.userId
      const queryText = "UPDATE public.players SET team_id = "+teamId+" WHERE id="+userId+";"
      console.log(queryText)
      client.query(queryText, (err, result) => {
        console.log(err ? err.stack : "Updated player id "+userId)
        resolve(result.fields)
      })
    })
  }

  const insertChallengeCompleted = (options) => {
    return new Promise(resolve => {
      const callengeId = options.callengeId
      const userId = options.userId
      const queryText = "INSERT INTO public.challenges_completed(id, player_id) VALUES ('"+callengeId+"', "+userId+");"
      console.log(queryText)
      client.query(queryText, (err, result) => {
        console.log(err ? err.stack : "Insertado jugador "+options.username)
        resolve(result.rows[0])
      })
    })
  }

  const getGames = (callback) => {
    const sql = "SELECT id, name, pin FROM games"
    console.log(sql)
    client.query(sql, function (err, result) {
      if (err) throw err
      callback(result.rows)
    })
  }

  const getPlayers = (game_id, callback) => {
    var sql = "SELECT * FROM players WHERE game_id="+game_id
    client.query(sql, function (err, result) {
      if (err) throw err
      callback(result.rows)
    })
  }

  const getTeams = (game_id, callback) => {
    var sql = "SELECT * FROM teams WHERE game_id="+game_id
    client.query(sql, function (err, result) {
      if (err) throw err
      callback(result.rows)
    })
  }

  const deletePlayer = (playerId, callback) => {
    var sql = "DELETE FROM players WHERE id = '"+playerId+"'"
    client.query(sql, function (err, result) {
      if (err) throw err
      //callback(result.rows) TODO qué devolver?
      callback(true)
    })
  }

  return {
    getGameData : getGameData,
    checkPlayerInDB : checkPlayerInDB,
    insertNewPlayer : insertNewPlayer,
    validateTeamKey : validateTeamKey,
    updateTeamPlayer : updateTeamPlayer,
    insertChallengeCompleted : insertChallengeCompleted,
    getGames : getGames,
    getPlayers : getPlayers,
    getTeams : getTeams,
    deletePlayer : deletePlayer,
  }
}

module.exports = DbActions