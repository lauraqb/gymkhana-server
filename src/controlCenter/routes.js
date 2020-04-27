
const express = require('express')
const router = express.Router()
const ccController = require('./controller')

//control center
router.get("/games", ccController.getAllGamesData)
router.get("/games/:gameId/players/", ccController.getPlayers)
router.get("/games/:gameId/teams/", ccController.getTeams)
router.get("/games/:gameId", ccController.getGameDataWithId)
router.put("/games/:gameId/updateChallenges/", ccController.updateGameChallenges)
router.get("/deletePlayer/:playerId", ccController.deletePlayer) //TODO .delete
router.get("/newGame/", ccController.addNewGame)
router.get("/coordinates", ccController.getAllCoordinates)

module.exports = router