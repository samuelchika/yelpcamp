const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { campgroundSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const {
  isLoggedIn,
  isAuthor,
  uploadImages,
  validateImageUploadUpdate
} = require("../middleware");
const campground = require("../controllers/campgroundController");

// validate campground input

const validateCampground = (res, req, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// const MAX_IMAGES = 4;
// var uploads = upload.array("image", MAX_IMAGES);
router
  .route("/")
  .get(catchAsync(campground.index))
  .post(
    isLoggedIn,
    validateCampground,
    uploadImages,
    catchAsync(campground.createCampground)
  );
// .post(
//   isLoggedIn,
//   validateCampground,
//   catchAsync(campground.createCampground)
// );
// create new campground
router.get("/new", isLoggedIn, campground.newForm);

router
  .route("/:id")
  .get(catchAsync(campground.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    uploadImages,
    validateImageUploadUpdate,
    catchAsync(campground.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground));

// edit campground
router.get("/:id/edit", isLoggedIn, catchAsync(campground.editCampground));

module.exports = router;
