const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csurf = require('csurf');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./models');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: 'secret_session_key',
  resave: false,
  saveUninitialized: true
}));

// CSRF protection middleware
app.use(csurf({ cookie: true }));

// Routes

// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// Redirect from home based on action
app.post("/", (req, res) => {
  const { action } = req.body;
  if (action === "login") {
    res.redirect("/login");
  } else if (action === "feedback") {
    res.redirect("/feedback");
  } else if (action === "features") {
    res.redirect("/features");
  } else {
    res.redirect("/");
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle login POST request
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    req.session.user = user;
    res.redirect(user.userType === "admin" ? "/admindash" : "/playerdash");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.redirect("/");
  });
});

// Admin dashboard
app.get("/admindash", (req, res) => {
  res.render("admindash");
});

// Player dashboard
app.get("/playerdash", (req, res) => {
  res.render("playerdash");
});

// Feedback page
app.get("/feedback", (req, res) => {
  res.render("feedback");
});

// Features page
app.get("/features", (req, res) => {
  res.render("features");
});

// Registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// Handle user registration
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync Sequelize models with the database and start the server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
