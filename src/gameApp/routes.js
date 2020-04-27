
const express = require('express')
const router = express.Router()
const gameController = require('./controller')

//game app
router.get("/", (req, res) => res.send('hi, gymkhana server'))
router.post("/validateGame", gameController.validateGame)
router.post("/joinUser", gameController.joinUser)
router.post("/joinTeam", gameController.joinTeam)
router.post("/game/challengeData", gameController.getCurrentChallengeData)
router.post("/game/validateAnswer", gameController.validateAnswer)
router.post("/game/challengeCompleted", gameController.challengeCompleted)
router.post("/game/getPoints", gameController.getPoints)

module.exports = router