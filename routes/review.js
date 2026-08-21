const express = require("express");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");

const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

router.post(
    "/",
    validateReview,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }

        const newReview = new Review(req.body.review);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();

        res.redirect(`/listings/${listing._id}`);
    })
);

router.delete(
    "/:reviewId",
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found!");
        }

        const reviewBelongsToListing = listing.reviews.some((review) =>
            review.equals(reviewId)
        );
        if (!reviewBelongsToListing) {
            throw new ExpressError(404, "Review not found!");
        }

        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            throw new ExpressError(404, "Review not found!");
        }

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;
