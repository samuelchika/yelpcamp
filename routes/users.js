const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registerUser = await User.register(user, password);
      req.login(registerUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Yelp-Camp");
        res.redirect("/campgrounds");
      });
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }),
  (req, res) => {
    const requestUrl = req.session.requestUrl
      ? req.session.requestUrl
      : "/campgrounds";
    req.session.requestUrl = null;
    req.flash("success", "Welcome Back!");
    res.redirect(requestUrl);
  }
);

// router.post('/login', (req, res) => {
//     passport.authenticate('local', (err, user, info) => {
//         // error connecting to the database;
//       if (err) {
//         return res.status(500).send("Error");
//       }
//       // if the user was not authenticated, the info holds the error message
//       if (!user && info) {
//           req.flash('error', info.message);
//         return res.status(422).redirect('/login');
//       }
//       // successfully authenticated thhe user
//       req.flash('success', 'Welcome Back!');
//       req.login()
//       res.redirect('/campgrounds');
//       // do something here and send back a res.json()
//     }) (req, res);
// });

//logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Successfully Logged Out - We will miss you!");
  res.redirect("/campgrounds");
});

module.exports = router;
