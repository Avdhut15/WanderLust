const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.create = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroy = async (req, res) => {
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

    const review = await Review.findById(reviewId);
    if (!review) {
        throw new ExpressError(404, "Review not found!");
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        throw new ExpressError(403, "You do not have permission to delete this review");
    }

    await review.deleteOne();
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "Review deleted successfully");
    res.redirect(`/listings/${id}`);
};
