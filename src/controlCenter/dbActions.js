//TODO convertirlo en class?
const DbActions = (client) => {

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
    getAllGames : getAllGames,
    getPlayers : getPlayers,
    getTeams : getTeams,
    getGameWithId : getGameWithId,
    deletePlayer : deletePlayer,
    updateGameChallenges : updateGameChallenges
  }
}
  
module.exports = DbActions