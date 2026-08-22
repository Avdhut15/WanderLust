const express = require("express");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const router = express.Router();

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    })
);

router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews");

        if (!listing) {
            throw new ExpressError(
                404,
                "The listing you are trying to access does not exist."
            );
        }

        res.render("listings/show.ejs", { listing });
    })
);

router.post(
    "/",
    validateListing,
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing created");
        res.redirect("/listings");
    })
);

router.get(
    "/:id/edit",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(
                404,
                "The listing you are trying to access does not exist."
            );
        }

        res.render("listings/edit.ejs", { listing });
    })
);

router.put(
    "/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { new: true }
        );
        req.flash("success", "Listing updated successfully");
        res.redirect(`/listings/${id}`);
    })
);

router.delete(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            throw new ExpressError(404, "Listing not found!");
        }

        await Review.deleteMany({ _id: { $in: deletedListing.reviews } });
    req.flash("success", "Listing deleted successfully");
        res.redirect("/listings");
    })
);

module.exports = router;
