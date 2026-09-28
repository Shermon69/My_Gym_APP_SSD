const express = require("express");

const paymentController = require("./../controllers/payment.controller");
const { authJwt } = require("./../middlewares");

const router = express.Router();

router.use(authJwt.verifyToken);

router
  .route("/")
  .post(paymentController.addPayment)
  .get(paymentController.getPayments);

module.exports = router;
