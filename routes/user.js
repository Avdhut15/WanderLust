const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveReditectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");
const { rateLimit } = require("express-rate-limit");
const { csrfProtection } = require("../utils/csrf.js");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many authentication attempts. Please try again later.",
});


router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(authLimiter, csrfProtection, wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        authLimiter,
        csrfProtection,
        saveReditectUrl,
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        userController.login
    );

router.post("/logout", csrfProtection, userController.logout);

module.exports = router;
