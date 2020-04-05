var DbActions = (client) => {
  const getGameDataWithPin = (pin, callback) => {
    const queryText = "SELECT id, name, pin, info FROM games WHERE pin = $1"
    return client.query(queryText, [pin]).then(res => res.rows)
  }
  
  /*** Join User */
   const insertNewPlayer = (options) => {
      const queryText = "INSERT INTO public.players(name, game_id) VALUES ('"+options.username+"', "+options.gameId+") RETURNING *;"
      return client.query(queryText).then(res => res.rows[0])
  }

  /** Join Team */
  const getTeamDataWithId = (options) => {
      const queryText = "SELECT * FROM teams WHERE key = $1 AND game_id = $2"
      return client.query(queryText, [options.key, options.gameId]).then(res => res.rows)
  }

  const updateTeamPlayer = (options) => {
    const queryText = "UPDATE players AS p SET team_id = $1 FROM teams AS t WHERE p.id= $2 AND t.key = $3 AND t.id = p.team_id RETURNING *;"
    return client.query(queryText, [options.teamId, options.userId, options.key])
  }

  const getCurrentChallengeData = (options) => {
    const queryText = "SELECT id FROM challenges_completed WHERE game_id = $1 AND player_id = $2 ORDER BY id DESC LIMIT 1;"
    const queryText2 = "SELECT info FROM games WHERE id = $1"
    return client.query(queryText, [options.gameId, options.userId]).then(res => {
      const challengeId = res.rows[0] ? res.rows[0].id+1 : 1
      console.log("challengeId : "+challengeId)
      return client.query(queryText2, [options.gameId]).then(res2 => {
        const challengeData = res2.rows[0].info[challengeId]
        challengeData.id = challengeId
        return challengeData
      })
    })
}

  function getPointsPlayer(options) {
    const queryText = "SELECT c.*, (SELECT player_id FROM challenges_completed WHERE id = $1 AND game_id = $2 ORDER BY timestamp ASC LIMIT 1) AS best_player,"+
    "g.info->c.id->'speedReward' AS speedReward FROM challenges_completed AS c LEFT JOIN games AS g ON c.game_id = g.id WHERE c.player_id = $1 AND c.game_id = $2;"
    return client.query(queryText, [options.userId, options.gameId]).then(res => {
      const result = res.rows
      let points = result.length
      for(var i = 0; i < result.length; i++) {
        if(result[i].speedreward && options.userId == result[i].best_player) points++
      }
      return {return: result, points: points}
    })
  }

  
  const checkIfBestPlayer = (options) => {
    const queryText = "SELECT * FROM challenges_completed WHERE id = $1 AND game_id = $2 ORDER BY timestamp ASC LIMIT 1;"
    return client.query(queryText, [options.callengeId, options.gameId]).then(res => {
      if(options.userId == res.rows[0].player_id) return {bestPlayer: true}
      return {bestPlayer: false}
    })
  }
  const insertChallengeCompleted = (options) => {
      const queryText = "INSERT INTO challenges_completed(id, game_id, player_id, timestamp) VALUES ($1, $2, $3, current_timestamp);"
      const queryText2 = "SELECT * FROM challenges_completed WHERE id = $1 AND game_id = $2 ORDER BY timestamp ASC LIMIT 1;"
      return client.query(queryText, [options.callengeId, options.gameId, options.userId]).then(res => {
        if(options.speedReward){
          return checkIfBestPlayer(options)
        }
        else return {bestPlayer: false}
      })
  }

  const getAllGames = (callback) => {
    const queryText = "SELECT id, name, pin FROM games"
    return client.query(queryText).then(res => res.rows)
  }

  const getPlayers = (gameId) => {
    var queryText = "SELECT * FROM players WHERE game_id = $1"
    return client.query(queryText, [gameId]).then(res => res.rows)
  }

  const getTeams = (gameId, callback) => {
    var sql = "SELECT * FROM teams WHERE game_id="+gameId
    client.query(sql, function (err, result) {
      if (err) throw err
      callback(result.rows)
    })
  }

  const getGameWithId = (options) => {
    var sql = "SELECT * FROM games WHERE id="+options.gameId
    return client.query(sql).then(res => res.rows[0])
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
    getGameDataWithPin : getGameDataWithPin,
    insertNewPlayer : insertNewPlayer,
    getTeamDataWithId : getTeamDataWithId,
    updateTeamPlayer : updateTeamPlayer,
    getCurrentChallengeData : getCurrentChallengeData,
    getPointsPlayer : getPointsPlayer,
    //checkChallengeCompleted : checkChallengeCompleted,
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