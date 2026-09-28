const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config.js");
const db = require("../models/auth");
const User = db.user;
const Role = db.role;

// V11 Fix: Read the JWT from an httpOnly cookie (set by Google OAuth login)
// OR from the x-access-token header (set by the existing username/password login).
// Cookie-based storage means JavaScript cannot read the token, eliminating
// the XSS risk that comes from storing tokens in localStorage.
verifyToken = (req, res, next) => {
  let token = req.cookies?.accessToken || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }
        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
};
module.exports = authJwt;