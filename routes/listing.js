const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listing.js");
const upload = require("../utils/upload.js");
const { csrfProtection } = require("../utils/csrf.js");
const {
    isLoggedIn,
    isOwner,
    requireListingImage,
    validateListing,
} = require("../middleware.js");

const router = express.Router();

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("image"),
        csrfProtection,
        requireListingImage,
        validateListing,
        wrapAsync(listingController.create)
    );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.show))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),
        csrfProtection,
        validateListing,
        wrapAsync(listingController.update)
    )
    .delete(
        isLoggedIn,
        isOwner,
        csrfProtection,
        wrapAsync(listingController.destroy)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    listingController.renderEditForm
);

module.exports = router;
