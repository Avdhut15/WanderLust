const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        throw new ExpressError(
            404,
            "The listing you are trying to access does not exist."
        );
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.create = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = (req, res) => {
    res.render("listings/edit.ejs", { listing: req.listing });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    Object.assign(req.listing, req.body.listing);
    await req.listing.save();
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
    await Review.deleteMany({ _id: { $in: req.listing.reviews } });
    await req.listing.deleteOne();
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
};
