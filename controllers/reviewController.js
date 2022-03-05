
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.newReview = async (req, res) => {
  // we have to fill in the review into the review array in the campground schema
  // save the review into the review table
  // find the campground using the id
  const campground = await Campground.findById(req.params.id);
  //console.log(campground);
  const review = new Review(req.body);
  // save the review to the campground
  review.author = req.user._id;
  //console.log(review);
  campground.review.push(review);
  // save the review to our db
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");

  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // we want to delete the object id that is related to the review we are removing
  await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
}