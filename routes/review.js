const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/review.js");
const { isLoggedIn, validateReview } = require("../middleware.js");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .post(
        isLoggedIn,
        validateReview,
        wrapAsync(reviewController.create)
    );

router
    .route("/:reviewId")
    .delete(isLoggedIn, wrapAsync(reviewController.destroy));

module.exports = router;
