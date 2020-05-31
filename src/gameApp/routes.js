
const express = require('express')
const router = express.Router()
const gameController = require('./controller')

//game app
router.post("/validateGame", gameController.validateGame)
router.post("/joinUser", gameController.joinUser)
router.post("/joinTeam", gameController.joinTeam)
router.post("/challengeData", gameController.getCurrentChallengeData)
router.post("/validateAnswer", gameController.validateAnswer)
router.post("/challengeCompleted", gameController.challengeCompleted)
router.post("/getPoints", gameController.getPoints)

module.exports = router