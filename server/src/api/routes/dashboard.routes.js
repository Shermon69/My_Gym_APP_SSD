const express = require("express");
const path = require("path");

const dashboardController = require("./../controllers/dashboard.controller");
const { authJwt } = require("./../middlewares");

const router = express.Router();

router.route("/").get(authJwt.verifyToken, dashboardController.getData);

module.exports = router;
