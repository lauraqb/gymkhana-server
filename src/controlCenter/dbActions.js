//TODO convertirlo en class?
const DbActions = (client) => {

  const getAllGames = () => {
    const queryText = "SELECT id, name, pin FROM games"
    return client.query(queryText).then(res => res.rows)
  }

  const getPlayers = (gameId) => {
    var queryText = "SELECT * FROM players WHERE game_id = $1"
    return client.query(queryText, [gameId]).then(res => res.rows)
  }

  const getTeams = (gameId) => {
    var queryText = "SELECT * FROM teams WHERE game_id= $1"
    return client.query(queryText, [gameId]).then(res => res.rows)
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

  const deletePlayer = (playerId) => {
    var queryText = "DELETE FROM players WHERE id = $1"
    return client.query(queryText, [playerId]).then(res => res.rows[0])
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