const rateLimit = require("express-rate-limit");
const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");

// Slow down password-guessing: after 10 failed-or-not login attempts from
// the same IP in 15 minutes, further attempts are rejected for a while.
// Without this, a script can try passwords as fast as the network allows.
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  app.post("/api/auth/signin", signinLimiter, controller.signin);
  app.post(
    "/api/auth/changePassword",
    [authJwt.verifyToken],
    controller.changePassword
  );

  app.get(
   "/api/users",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.getUsers
);
};