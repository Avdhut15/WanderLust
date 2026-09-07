const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/review.js");
const { isLoggedIn, validateReview } = require("../middleware.js");
const { csrfProtection } = require("../utils/csrf.js");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .post(
        isLoggedIn,
        csrfProtection,
        validateReview,
        wrapAsync(reviewController.create)
    );

router
    .route("/:reviewId")
    .delete(isLoggedIn, csrfProtection, wrapAsync(reviewController.destroy));

module.exports = router;
