const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listing.js");
const {
    isLoggedIn,
    isOwner,
    validateListing,
} = require("../middleware.js");

const router = express.Router();

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
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
        validateListing,
        wrapAsync(listingController.update)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroy)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    listingController.renderEditForm
);

module.exports = router;
