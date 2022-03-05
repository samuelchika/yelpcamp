const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../schema.js");
const reviewController = require("../controllers/reviewController");

const ExpressError = require("../utils/ExpressError");

// provide validation for review also
const validateReview = (res, req, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// REVIEW
router.post("/", validateReview, catchAsync(reviewController.newReview));

// Delete review
router.delete("/:reviewId", catchAsync(reviewController.deleteReview));

module.exports = router;
