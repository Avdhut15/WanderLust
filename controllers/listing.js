const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const cloudinary = require("../config/cloudinary.js");
const geocodeLocation = require("../utils/geocode.js");

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "wanderlust/listings", resource_type: "image" },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        stream.end(file.buffer);
    });
};

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

    if (!listing.geometry?.coordinates?.length) {
        const geometry = await geocodeLocation(listing.location, listing.country);
        if (geometry) {
            listing.geometry = geometry;
            await listing.save();
        }
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.create = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.geometry = await geocodeLocation(
        newListing.location,
        newListing.country
    );
    if (req.file) {
        const uploadedImage = await uploadToCloudinary(req.file);
        newListing.image = {
            filename: uploadedImage.public_id,
            url: uploadedImage.secure_url,
        };
    }
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
    const locationChanged =
        req.body.listing.location !== req.listing.location ||
        req.body.listing.country !== req.listing.country;
    Object.assign(req.listing, req.body.listing);
    if (locationChanged) {
        req.listing.geometry = await geocodeLocation(
            req.listing.location,
            req.listing.country
        );
    }
    if (req.file) {
        const uploadedImage = await uploadToCloudinary(req.file);
        req.listing.image = {
            filename: uploadedImage.public_id,
            url: uploadedImage.secure_url,
        };
    }
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
