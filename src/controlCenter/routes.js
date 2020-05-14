
const express = require('express')
const router = express.Router()
const ccController = require('./controller')

//control center
// router.get("/", (rreq, es) => res.status(200).json({ name: 'john' }))
router.get("/games", ccController.getGamesList)
router.get("/games/:gameId/players/", ccController.getPlayers)
router.get("/games/:gameId/teams/", ccController.getTeams)
router.put("/games/:gameId/teams/", ccController.insertNewTeam)
router.get("/games/:gameId", ccController.getGameDataWithId)
router.put("/games/:gameId/updateChallenges/", ccController.updateGameChallenges)
router.get("/deletePlayer/:playerId", ccController.deletePlayer) //TODO .delete
router.get("/newGame/", ccController.addNewGame)
router.get("/coordinates", ccController.getAllCoordinates)

module.exports = router