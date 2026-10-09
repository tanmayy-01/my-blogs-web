require('dotenv').config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const db = require('./database');
const bcrypt = require("bcrypt");

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 30 },
  }),
);

const protectRoute = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/login");
};

const redirectIfLoggedIn = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
};

app.use(express.static("public"));
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.get(['/','/home'], protectRoute, (req,res) => {
    res.render('home.ejs', { username: req.session.username })
})

app.get('/login', redirectIfLoggedIn,(req, res) => {
  res.render("login.ejs",{ error: null });
});

app.get("/register",redirectIfLoggedIn, (req, res) => {
    req.session.isLoggedIn
  res.render("register.ejs",{ error: null });
});

app.post("/login", redirectIfLoggedIn, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.render("login.ejs", { error: "Invalid email or password." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render("login.ejs", { error: "Invalid email or password." });
    }
    req.session.isLoggedIn = true;
    req.session.username = user.username;
    req.session.userId = user.id;

    res.redirect("/");
  } catch (error) {
    res.render("login.ejs", { error: "An unexpected error occurred." });
  }
});

app.post('/register', redirectIfLoggedIn, async(req, res) => {
    const {username, email, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password,10)
        const insertUser = db.prepare(
            "INSERT INTO users (username, email, password) VALUES ( ?, ?, ?)"
        )
        insertUser.run(username,email,hashedPassword)

        req.session.isLoggedIn = true;
        req.session.username = username;

        res.redirect("/");
    } catch (error) {
        console.error(error)
        res.render("register.ejs", { error: "Something went wrong. Please try again." });
    }
    
})


app.get("/logout", (req, res) => {
  
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.redirect("/"); 
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});


app.listen(process.env.PORT, () => {
  console.log("server started", process.env.PORT);
});
