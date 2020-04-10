
const express = require('express')
const router = express.Router()
const gameController = require('./controller')

//game app
router.get("/", (req, res) => res.send('hola'))
router.post("/validateGame", gameController.validateGame)
router.post("/joinUser", gameController.joinUser)
router.post("/joinTeam", gameController.joinTeam)
router.post("/challengeData", gameController.getChallengeData)
router.post("/challengeCompleted", gameController.challengeCompleted)
router.post("/getPoints", gameController.getPoints)

module.exports = router