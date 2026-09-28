const express = require('express')
const path = require("path");

const trainerController = require('./../controllers/trainer.controller')
const { authJwt } = require('./../middlewares')


const router = express.Router();

// Same rule as members: logged-in users can read and edit, only admins
// can delete.
router.use(authJwt.verifyToken)

router.route('/')
.get(trainerController.getAllTrainers)
.post( trainerController.addTrainer)



router.route('/:id')
.get(trainerController.getTrainer)
.patch(trainerController.updateTrainer)
.delete(authJwt.isAdmin, trainerController.deleteTrainer)

module.exports = router;
