const express = require('express');
const router = express.Router({mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schema.js');

const ExpressError = require('../utils/ExpressError');


// provide validation for review also
const validateReview = (res, req, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// REVIEW
router.post('/', validateReview, catchAsync(async (req, res) => {
    // we have to fill in the review into the review array in the campground schema
    // save the review into the review table
    // find the campground using the id
    const campground = await Campground.findById(req.params.id)
    //console.log(campground);
    const review = new Review(req.body);
    // save the review to the campground
    review.author = req.user._id;
    //console.log(review);
    campground.review.push(review);
    // save the review to our db
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');

    res.redirect(`/campgrounds/${campground._id}`);

}));

// Delete review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // we want to delete the object id that is related to the review we are removing
    await Campground.findByIdAndUpdate(id, {$pull: {review: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;