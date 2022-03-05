const Campground = require("./models/campground");

// multer
const multer = require("multer");
const { storage, cloudinary } = require("./cloudinary/cloudinary");
const upload = multer({ storage: storage });

// set max size of the images to upload
const MAX_IMAGES = 4;
var uploads = upload.array("image", MAX_IMAGES);

module.exports.isLoggedIn = (req, res, next) => {
  const requestUrl = req.originalUrl;
  req.session.requestUrl = req.originalUrl;
  // console.log(requestUrl)
  if (!req.isAuthenticated()) {
    // user is not loggedIn
    req.flash("error", "You must be login");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.uploadImages = (req, res, next) => {
  uploads(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // An error occured when uploading
      //console.log(err.code);
      req.flash(
        "error",
        `Error uploading image: Max amount of image should be ${MAX_IMAGES}`
      );
      return res.redirect("campgrounds/new");
    }
    // Everything went fine.
    next();
  });
};

// check how many image is uploaded already before continue
module.exports.validateImageUploadUpdate = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // we get the campground, and check how many images was uploaded
  const totalImage = req.files.length + campground.images.length;
  if (totalImage > 4) {
    // image limit is reached, alert user to delete some image before they continue
    req.flash(
      "error",
      `Image Upload limit for a campground is ${MAX_IMAGES}. \nYou already have ${campground.images.length} images uploaded for this campground. \nDelete some images below to continue.`
    );
    // delete the recently uploaded image.
    req.files.forEach((image, i) => {
      cloudinary.uploader.destroy(image.filename);
    });
    return res.redirect(`/campgrounds/${id}/edit`);
  }
  //res.send(campground);
  next();
};
