require('dotenv').config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

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

app.get(['/','/home'], protectRoute, (req,res) => {
    res.render('home.ejs')
})

app.get('/login', redirectIfLoggedIn,(req, res) => {
  res.render("login.ejs");
});

app.get("/register",redirectIfLoggedIn, (req, res) => {
  res.render("register.ejs");
});

app.listen(process.env.PORT, () => {
  console.log("server started", process.env.PORT);
});
