const DbActions = require('./dbActions')
const client = require("../db")
const dba = DbActions(client)
const time = () => {
    let date_ob = new Date()
    let hours = date_ob.getHours()
    let minutes = date_ob.getMinutes()
    return "[" + hours + ":" + minutes + "] "
}

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
      userId: req.body.userId,
      gameId : req.body.gameId,
      key: req.body.key,
    }
  
    dba.updateTeamPlayer(options).then(r => {
      dba.getTeamDataWithId(options).then(response => {
        res.send( { 
          invalidKey: response.length == 0 ? true : false, 
          result: response.length == 0 ? null : response[0] 
        })
      })
    })
    .catch(error => res.send( {error: error}))
}
  
exports.getChallengeData = function(req, res) {
    console.log(time()+"getChallengeData()")
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
      callengeId: req.body.callengeId,
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
  
