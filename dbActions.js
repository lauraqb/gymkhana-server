var DbActions = (client) => {
  const getGameData = (pin, callback) => {
    if(!pin || typeof pin !== "string") {
      return console.log("PIN incorrecto")
    }
    var queryText = "SELECT id, name, pin, info FROM games WHERE pin ='"+pin+"'"
    console.log(queryText)
    client.query(queryText, (err, result) => {
      if (err) throw err
      const data = result.rows
      callback(data)
    })
  }
  
  /*** Join User */
  const checkPlayerInDB = (options) => {
    return new Promise((resolve, reject) => { 
      const username = options.username
      const gameId = options.gameId
      if(!username || !gameId) reject("Uno de los parámetros no está definido: username: "+username+" ,gameId: "+gameId)
      //if(typeof username !== "string") return console.log("nombreJugador is a: "+typeof pin)
      var queryText = "SELECT name FROM players WHERE name ='"+username+"' AND game_id='"+gameId+"'"
      console.log(queryText)
      client.query(queryText, function (err, result) {
        if (err) throw err;
        resolve(result.rows) 
      })
    })
  }

  // const insertNewPlayer = (options) => {
  //   return new Promise(resolve => { 
  //     const queryText = "INSERT INTO public.players(name, game_id) VALUES ('"+options.username+"', "+options.game_id+") RETURNING *;"
  //     console.log(queryText)
  //     client.query(queryText, (err, result) => {
  //       console.log(err ? err.stack : "Insertado jugador "+options.username)
  //       resolve(result.rows[0])
  //     })
  //   })
  // }
  const insertNewPlayer = (options) => {
      const queryText = "INSERT INTO public.players(name, game_id) VALUES ('"+options.username+"', "+options.gameId+") RETURNING *;"
      return client.query(queryText).then(res => res.rows[0])
  }

  /** Join Team */
  const validateTeamKey = (options) => {
    return new Promise(resolve => { 
      const key = options.key
      const gameId = options.gameId
      const queryText = "SELECT * FROM teams WHERE key = $1 AND game_id = $2"
      console.log(queryText)
      client.query(queryText, [key, gameId], function (err, result) {
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

  const getAllGames = (callback) => {
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

  const getTeams = (gameId, callback) => {
    var sql = "SELECT * FROM teams WHERE game_id="+gameId
    client.query(sql, function (err, result) {
      if (err) throw err
      callback(result.rows)
    })
  }

  const getGameWithId = (gameId, callback) => {
    if (!gameId) return "Error: gameId not defined"
    var sql = "SELECT * FROM games WHERE id="+gameId
    console.log(sql)
    client.query(sql, function (err, result) {
      if (err) throw err
      callback(result.rows[0])
    })
  },
  
  updateGameChallenges = (options, callback) => {
    const gameId = options.gameId
    const challenges = options.challenges
    const queryText = "UPDATE games SET info = '"+options.challenges+"' WHERE id="+gameId+";"
    console.log(queryText)
    client.query(queryText, (err, result) => {
      console.log(err ? err.stack : "Updated game id "+gameId)
      const data = {
        error : err ? err.stack : false,
        result : result
      }
      callback(data)
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
    getAllGames : getAllGames,
    getPlayers : getPlayers,
    getTeams : getTeams,
    getGameWithId : getGameWithId,
    deletePlayer : deletePlayer,
    updateGameChallenges : updateGameChallenges
  }
}

module.exports = DbActions