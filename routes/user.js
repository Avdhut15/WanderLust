const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");


// Signup GET route
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req,res) => {
    try {
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log((registeredUser));
        req.flash("success","user was registered");
        res.redirect("/listings");
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}));

// Login GET route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Login POST route
router.post("/login",
     passport.authenticate("local",
         {
            failureFlash: true,
            failureRedirect: "/login"}),
    (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect("/listings");
    });

module.exports = router;
