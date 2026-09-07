require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy  = require("passport-local");
const helmet = require("helmet");
const User = require("./models/user.js");
const { generateToken } = require("./utils/csrf.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (isProduction && !sessionSecret) {
    throw new Error("SESSION_SECRET must be configured in production.");
}

async function main() {
    await mongoose.connect(MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
    });
}

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org", "https://tiles.openfreemap.org"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://*.tile.openstreetmap.org", "https://tiles.openfreemap.org"],
            fontSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com"],
            workerSrc: ["'self'", "blob:"],
        },
    },
}));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
    secret: sessionSecret || "development-only-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URL,
        ttl: 7 * 24 * 60 * 60,
    }),
    cookie: {
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
    }
};

// // Home Route
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
    res.locals.csrfToken = generateToken(req);
    next();
});


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.currentUrl = req.originalUrl;
    next();
});


// app.get("/demouser",async(req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
    
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 Route (Express 5)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;

    if (statusCode === 404) {
        return res.status(404).render("error.ejs", {err});
    }

    res.locals.error = [message];
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
});

// Server
async function startServer() {
    try {
        await main();
        console.log("Connected to DB");
        app.listen(8080, () => {
            console.log("Server is listening on port 8080");
        });
    } catch (err) {
        console.error("Unable to connect to MongoDB:", err.message);
        process.exitCode = 1;
    }
}

startServer();
