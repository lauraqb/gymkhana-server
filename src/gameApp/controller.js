const DbActions = require('./dbActions')
const client = require("../db")
const dba = DbActions(client)
const time = require('../utils/time')

// Validate a Pin Game
exports.validateGame = function (req, res) {
    console.log(time()+"validateGame()")
    const pin = req.body.pin
    dba.getGameDataWithPin(pin).then( response => res.send({
        valid : response.length === 0 ? false : true,
        result : response.length === 0 ? null : response[0]
      }))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}

exports.joinUser = function(req, res) {
    console.log(time()+"joinUser()")
    const options = {
        username: req.body.username,
        gameId : req.body.gameId,
    }
    dba.insertNewPlayer(options).then( response => res.send({result: response}) )
    .catch( error => {
        if(error.code == "23505") res.send({duplicated: true})
        else {
            console.log(error)
            res.send({error: error})
        }
    })
}

exports.joinTeam = function(req, res) {
    console.log("JoinTeam()")
    const options = {
      userId: req.body.userid,
      gameId : req.body.gameId,
      key: req.body.key,
    }
    console.log(options)
    if(!options.userId || !options.gameId ) {
      res.send( {error: "userid o gameId undefined"})
      return
    }
    dba.updateTeamPlayer(options).then(response => {
      console.log("updateTeamPlayer: "+response)
      res.send( { 
            invalidKey: response.length == 0 ? true : false, 
            result: response.length == 0 ? null : response
          })
    })
    .catch(error => { console.log(error)
      res.send( {error: error})})
}
  
exports.getCurrentChallengeData = function(req, res) {
    console.log(time()+"getCurrentChallengeData()")
    const options = {
      userId: req.body.userId,
      gameId : req.body.gameId,
    }
    dba.getCurrentChallengeData(options).then( response => res.send({result: response}))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}

exports.validateAnswer = (req, res) => {
  const options = {
    gameId : req.body.gameId,
    challengeId: req.body.challengeId,
    answer: req.body.answer
  }
  dba.getChallengeSolution(options).then( response => {
    //if (answer == response) añadir regex para validar que solution contenga la respuesta
    res.send({
      valid: options.answer===response.solution.toLowerCase().trim() || options.answer==="---" ? true : false, 
    })
  })
}
  
exports.getPoints = function(req, res) {
    console.log(time()+"getPoints()")
    const options = {
      userId: req.body.userId,
      gameId : req.body.gameId,
    }
    dba.getPointsPlayer(options).then( response => res.send(response))
    .catch( error => {
        console.log(error)
        res.send({error: error})
    })
}
  
exports.challengeCompleted= function(req, res) {
    console.log(time()+"challengeCompleted()")
    const options = {
      challengeId: req.body.challengeId,
      userId : req.body.userId,
      gameId: req.body.gameId,
      teamId: req.body.teamId,
      speedReward: req.body.speedReward
    }
  
    dba.insertChallengeCompleted(options).then(response => res.send(response))
    .catch(error => {
      console.log(error); res.send( {error: error})
    })
      //io.sockets.emit('server/challengePassed', options);
}
  
