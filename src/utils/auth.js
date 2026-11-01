const jwt = require("jsonwebtoken");

function createAuthToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie("studiospace_token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge,
  });
}

function clearAuthCookie(res) {
  res.clearCookie("studiospace_token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
  };
}

module.exports = { createAuthToken, setAuthCookie, clearAuthCookie, publicUser };
