/*** GAME APP */
//TODO convertirlo en class?
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

  const updateTeamPlayer = (options) => {
    const queryText = "UPDATE players AS p SET team_id = t.id FROM teams AS t WHERE p.id= $1 AND t.game_id = $2 AND t.key = $3 RETURNING *;"
    return client.query(queryText, [options.userId, options.gameId, options.key]).then(res => res.rows[0])
  }

  const getCurrentChallengeData = (options) => {
    const queryText = "SELECT id FROM challenges_completed WHERE game_id = $1 AND player_id = $2 ORDER BY id DESC LIMIT 1;"
    const queryText2 = "SELECT info FROM games WHERE id = $1"
    return client.query(queryText, [options.gameId, options.userId]).then(res => {
      const challengeId = res.rows[0] ? res.rows[0].id+1 : 1
      return client.query(queryText2, [options.gameId]).then(res2 => {
          const challengeData = res2.rows[0].info[challengeId]
          challengeData.solution = null //para evitar que se envíe este campo al cliente
          challengeData.id = challengeId
          return challengeData
      })
    })
  }

  const getChallengeSolution = (options) => {
    const queryText = "SELECT info->"+options.challengeId+"->'solution' AS solution FROM games WHERE id = $1"
    return client.query(queryText, [options.gameId]).then(res => res.rows[0])
  }

  function getPointsPlayer(options) {
    const queryText = "SELECT c.*, (SELECT player_id FROM challenges_completed WHERE id = $1 AND game_id = $2 ORDER BY timestamp ASC LIMIT 1) AS best_player,"+
    "g.info->c.id->'speedReward' AS speedReward FROM challenges_completed AS c LEFT JOIN games AS g ON c.game_id = g.id WHERE c.player_id = $1 AND c.game_id = $2;"
    return client.query(queryText, [options.userId, options.gameId]).then(res => {
      const result = res.rows
      let points = result.length
      console.log("points: "+points)
      for(var i = 0; i < result.length; i++) {
        if(result[i].speedreward && options.userId == result[i].best_player) points++
      }
      console.log("points2: "+points)
      return {return: result, points: points}
    })
  }
  
  const insertChallengeCompleted = (options) => {
    console.log("insert challenge "+options.challengeId)
      const queryText = "INSERT INTO challenges_completed(id, game_id, player_id, timestamp) VALUES ($1, $2, $3, current_timestamp);"
      return client.query(queryText, [options.challengeId, options.gameId, options.userId]).then(res => {
        return res.rows[0]
      })
  }

  return {
    getGameDataWithPin : getGameDataWithPin,
    insertNewPlayer : insertNewPlayer,
    updateTeamPlayer : updateTeamPlayer,
    getCurrentChallengeData : getCurrentChallengeData,
    getChallengeSolution : getChallengeSolution,
    getPointsPlayer : getPointsPlayer,
    insertChallengeCompleted : insertChallengeCompleted
  }
}
  
module.exports = DbActions