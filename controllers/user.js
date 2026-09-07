const User = require("../models/user.js");

const getSafeRedirect = (redirectUrl) => {
    const isLocalUrl = redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//");
    const isAuthPage = typeof redirectUrl === "string" &&
        (redirectUrl === "/login" || redirectUrl.startsWith("/login?") ||
        redirectUrl === "/signup" || redirectUrl.startsWith("/signup?") || redirectUrl === "/logout");

    return isLocalUrl && !isAuthPage
        ? redirectUrl
        : null;
};

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "user was registered");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    const queryRedirect = getSafeRedirect(req.query.redirect);
    if (req.query.redirect) {
        req.session.redirectUrl = queryRedirect || "/listings";
    }

    res.render("users/login.ejs", {
        redirectUrl: queryRedirect || getSafeRedirect(req.session.redirectUrl) || "/listings",
    });
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl =
        getSafeRedirect(res.locals.redirectUrl) || getSafeRedirect(req.body.redirect) || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings");
    });
};
