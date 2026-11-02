const jwt = require("jsonwebtoken");

// Sign a short-lived token that identifies the logged-in account.
function createAuthToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Keep the token out of browser JavaScript by using an HTTP-only cookie.
function setAuthCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie("studiospace_token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge,
  });
}

// Use the same cookie settings when signing out so the browser removes it.
function clearAuthCookie(res) {
  res.clearCookie("studiospace_token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  });
}

// Return only the account fields that are safe for the client to display.
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    savedStudios: (user.savedStudios || []).map((studioId) =>
      studioId.toString(),
    ),
  };
}

module.exports = {
  createAuthToken,
  setAuthCookie,
  clearAuthCookie,
  publicUser,
};
