
/*** CONTROL CENTER */
const express = require('express')
const router = express.Router()
const ccController = require('./controller')

//control center
router.get("/games", ccController.getGamesData)
router.get("/games/:gameId/players/", ccController.getPlayers)
router.get("/games/:gameId/teams/", ccController.getTeams)
router.get("/games/:gameId/challenges/", ccController.getGameDataWithId)
router.put("/games/:gameId/updateChallenges/", ccController.updateGameChallenges)
router.get("/deletePlayer/:playerId", ccController.deletePlayer) //TODO .delete
router.get("/newGame/", ccController.addNewGame) //TODO .delete
//router.get("/coordinates", getAllCoordinates)

module.exports = router