const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { Router } = require("express");
const User = require("../models/User");
const {
  clearAuthCookie,
  createAuthToken,
  publicUser,
  setAuthCookie,
} = require("../utils/auth");
const requireAuth = require("../middleware/requireAuth");

const router = Router();

// Keep input checks here so invalid credentials never reach the database.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordError(password) {
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  return null;
}

router.post("/register", async (req, res) => {
  const { name, email, photoURL = "", password } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Please enter your name." });
  }
  if (typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const validationMessage = passwordError(password);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.exists({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    photoURL: typeof photoURL === "string" ? photoURL.trim() : "",
    passwordHash,
  });

  return res.status(201).json({
    message: "Your account has been created. Please log in.",
    user: publicUser(user),
  });
});

// A successful password check creates the same cookie session as Google sign-in.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Enter your email and password." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "The email or password is incorrect." });
  }

  setAuthCookie(res, createAuthToken(user._id.toString()));
  return res.json({ message: "You are logged in.", user: publicUser(user) });
});

router.post("/google", async (req, res, next) => {
  const { credential } = req.body;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(503).json({ message: "Google sign-in is not configured yet." });
  }
  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({ message: "A Google sign-in credential is required." });
  }

  // Verify Google's signed credential on the server before trusting profile details.
  const googleClient = new OAuth2Client(clientId);
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
  } catch (error) {
    const invalidCredentialMessages = [
      "Wrong number of segments in token:",
      "Can't parse token envelope:",
      "Can't parse token payload",
      "No pem found for envelope:",
      "Invalid token signature:",
      "No issue time in token:",
      "No expiration time in token:",
      "iat field using invalid format",
      "exp field using invalid format",
      "Expiration time too far in future:",
      "Token used too early,",
      "Token used too late,",
      "Invalid issuer,",
      "Wrong recipient, payload audience",
    ];

    if (invalidCredentialMessages.some((message) => error.message?.startsWith(message))) {
      return res.status(401).json({ message: "Google could not verify this account." });
    }

    return next(error);
  }

  const profile = ticket.getPayload();

  if (!profile || !profile.email || !profile.email_verified) {
    return res.status(401).json({ message: "Google could not verify this account." });
  }

  const email = profile.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    const passwordHash = await bcrypt.hash(
      `${require("crypto").randomBytes(32).toString("hex")}Aa`,
      12,
    );
    user = await User.create({
      name: profile.name || email,
      email,
      photoURL: profile.picture || "",
      passwordHash,
    });
  }

  setAuthCookie(res, createAuthToken(user._id.toString()));
  return res.json({ message: "You are logged in with Google.", user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "You are logged out." });
});

router.patch("/profile", requireAuth, async (req, res) => {
  const { photoURL } = req.body;

  if (typeof photoURL !== "string" || !photoURL.trim() || photoURL.length > 2048) {
    return res.status(400).json({ message: "Choose a valid profile photo." });
  }

  let photo;
  try {
    photo = new URL(photoURL.trim());
  } catch {
    return res.status(400).json({ message: "Choose a valid profile photo." });
  }

  if (!["http:", "https:"].includes(photo.protocol)) {
    return res.status(400).json({ message: "Choose a valid profile photo." });
  }

  req.user.photoURL = photo.toString();
  await req.user.save();

  return res.json({ message: "Your profile photo has been updated.", user: publicUser(req.user) });
});

router.get("/me", (req, res, next) => {
  if (!req.cookies.studiospace_token) {
    return res.json({ user: null });
  }

  // A visitor without a cookie is a normal signed-out session, not a server error.
  return requireAuth(req, res, (error) => {
    if (error) {
      return next(error);
    }

    return res.json({ user: publicUser(req.user) });
  });
});

module.exports = router;
