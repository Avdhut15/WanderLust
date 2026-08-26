const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to do that.");
        return res.redirect("/login");
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        return next(new ExpressError(403, "You do not have permission to do that"));
    }

    req.listing = listing;
    next();
};

module.exports.saveReditectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};
