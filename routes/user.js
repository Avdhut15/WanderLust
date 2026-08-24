const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveReditectUrl } = require("../middleware.js");


// get signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// create user
router.post("/signup", wrapAsync(async(req,res) => {
    try {
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) =>{
            if(err){
                return next(err);
            }
            req.flash("success","user was registered");
            res.redirect("/listings");
        })
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}));

// get login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// log in user
router.post("/login", 
    saveReditectUrl,
     passport.authenticate("local",
         {
            failureFlash: true,
            failureRedirect: "/login"}),
    (req, res) => {
        req.flash("success", "Welcome back!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    });


router.get("/logout", (req,res, next) =>{
    req.logout((err) =>{
        if (err){
           return next(err);
        }
        req.flash("success","logged out successfully");
        res.redirect("/listings");
    })
})

module.exports = router;
