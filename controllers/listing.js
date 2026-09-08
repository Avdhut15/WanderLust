const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const cloudinary = require("../config/cloudinary.js");
const geocodeLocation = require("../utils/geocode.js");
const TAX_RATE = 0.18;
const categoryMatchers = {
    Rooms: /room|loft|apartment|villa|cottage|house|penthouse|brownstone|bungalow/i,
    "Iconic Cities": /city|downtown|apartment|brownstone|canal|art deco|new york|miami|boston|tokyo|dubai|amsterdam|florence/i,
    Mountains: /mountain|cabin|ski|alps|banff|aspen|montana|lake tahoe/i,
    Castles: /castle|palace|royal/i,
    "Amazing Pools": /pool|villa|resort|oasis|penthouse/i,
    Camping: /camp|treehouse|cabin|lodge|retreat/i,
    Farms: /farm|safari|serengeti|ranch/i,
    Arctic: /arctic|ski|alps|banff|snow|chalet/i,
    Domes: /dome|oasis|igloo|desert/i,
    Boats: /boat|island|lake|canal|beach|coast|ocean|sea/i,
};
const searchableFields = ["title", "description", "location", "country", "category"];

const getCategoryMatcher = (value) => {
    const normalizedValue = value.trim().toLowerCase();
    return Object.entries(categoryMatchers).find(([name]) => {
        const normalizedName = name.toLowerCase();
        return normalizedName === normalizedValue || normalizedName.replace(/s$/, "") === normalizedValue.replace(/s$/, "");
    })?.[1];
};

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
    const { search = "", category = "", minPrice = "", maxPrice = "", taxes = "" } = req.query;
    const filters = {};
    const trimmedSearch = search.trim();
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (trimmedSearch && trimmedSearch.toLowerCase() !== "trending") {
        const categoryMatcher = getCategoryMatcher(trimmedSearch);
        if (categoryMatcher) {
            filters.$and = [{
                $or: searchableFields.map((field) => ({ [field]: categoryMatcher })),
            }];
        } else {
            const searchTerms = trimmedSearch
                .split(/\s+/)
                .map((term) => new RegExp(escapeRegex(term), "i"));
            filters.$and = searchTerms.map((searchRegex) => ({
                $or: searchableFields.map((field) => ({ [field]: searchRegex })),
            }));
        }
    }

    if (category.trim()) {
        const selectedCategory = category.trim();
        if (selectedCategory !== "Trending") {
            const categoryConditions = [
                { category: selectedCategory },
                ...["title", "description", "location", "country"].map((field) => ({
                    [field]: categoryMatchers[selectedCategory] || new RegExp(selectedCategory, "i"),
                })),
            ];
            filters.$and = [
                ...(filters.$and || []),
                { $or: categoryConditions },
            ];
        }
    }

    const priceFilter = {};
    const minimum = Number(minPrice);
    const maximum = Number(maxPrice);
    if (minPrice !== "" && Number.isFinite(minimum) && minimum >= 0) {
        priceFilter.$gte = minimum;
    }
    if (maxPrice !== "" && Number.isFinite(maximum) && maximum >= 0) {
        priceFilter.$lte = maximum;
    }
    if (Object.keys(priceFilter).length) {
        filters.price = priceFilter;
    }

    const allListings = await Listing.find(filters).sort({ _id: -1 });
    res.render("listings/index.ejs", {
        allListings,
        filters: { search, category, minPrice, maxPrice, taxes: taxes === "1" },
        taxRate: TAX_RATE,
    });
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

    res.render("listings/show.ejs", {
        listing,
        taxes: req.query.taxes === "1",
        taxRate: TAX_RATE,
    });

    if (!listing.geometry?.coordinates?.length) {
        geocodeLocation(listing.location, listing.country)
            .then(async (geometry) => {
                if (geometry) {
                    await Listing.findByIdAndUpdate(id, { geometry });
                }
            })
            .catch((error) => {
                console.error("Unable to geocode listing location:", error.message);
            });
    }
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
