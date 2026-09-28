const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const db = require("../models/auth");
const config = require("../../config/auth.config");

const User = db.user;
const Role = db.role;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google
 *
 * Receives a Google ID token (from the PKCE Authorization Code flow on the
 * client) and verifies it server-side using Google's public keys via the
 * google-auth-library. If the token is valid and the audience matches our
 * client ID, we look up or create the user and issue our own short-lived
 * JWT as an httpOnly, Secure, SameSite=Strict cookie so it is never readable
 * by JavaScript (fixing V11 – JWT in localStorage).
 */
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).send({ message: "Missing Google credential." });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).send({ message: "Invalid Google token." });
  }

  const { sub: googleId, email, name } = payload;

  try {
    // Find or create the user. Google-authenticated users have no password.
    let user = await User.findOne({ email }).populate("roles", "-__v");

    if (!user) {
      // Assign the default non-admin role on first Google sign-in
      const userRole = await Role.findOne({ name: "moderator" });
      user = new User({
        username: name || email.split("@")[0],
        email,
        password: "", // No password for OAuth users
        googleId,
        roles: userRole ? [userRole._id] : [],
      });
      await user.save();
      user = await User.findById(user._id).populate("roles", "-__v");
    }

    // Build the authorities list
    const authorities = (user.roles || []).map(
      (r) => "ROLE_" + r.name.toUpperCase()
    );

    // Issue our own app JWT — short-lived (1 hour)
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 3600,
    });

    // Store the JWT in an httpOnly cookie — JavaScript cannot read this,
    // which eliminates the XSS risk of localStorage (V11 fix).
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600 * 1000, // 1 hour in ms
    });

    return res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      // Do NOT send the raw token in the body — it stays in the cookie.
      accessToken: null,
      googleAuth: true,
    });
  } catch (err) {
    return res.status(500).send({ message: "Server error during Google login." });
  }
};
