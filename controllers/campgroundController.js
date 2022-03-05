const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/cloudinary");
// this is the GEO Coding
const mapGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
  // we are using the try and catch, should there be an error with mongo
  // maybe a validation error etc
  // it will be thrown to our error handler below to take care of it
  // the catch, catches the error and send it to the handler using the next parameter
  //try {
  //console.log(req.body.campground)

  // when someone wants to post something they need to post on campground.
  // using postman dey can mainipulate our data.
  //we need to ensure we have the json data
  // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

  // using Joi for validation.
  // const campgroundSchema = Joi.object({
  //     campground: Joi.object({
  //         title: Joi.string()
  //                     .required(),
  //         price: Joi.number()
  //             .required()
  //             .min(0),
  //         image: Joi.string()
  //             .required(),
  //         description: Joi.string()
  //             .required(),
  //         location: Joi.string()
  //         .required()
  //     }).required()
  // });

  // const { error } = campgroundSchema.validate(req.body);
  // if(error) {
  //     const msg = error.details.map(el => el.message).join(',');
  //     throw new ExpressError(msg, 400);
  // }
  const campground = new Campground(req.body.campground);
  const images = req.files.map((img) => ({
    url: img.path,
    filename: img.filename
  }));
  const geoData = await geocoder
    .forwardGeocode({ query: req.body.campground.location, limit: 1 })
    .send();
  campground.images = images;
  campground.author = req.user;
  const geometry = geoData.body.features[0].geometry;
  campground.geometry = geometry;
  console.log(campground);
  await campground.save();
  // we are inputing the flash message here
  req.flash("success", `Successfully created Campground: ${campground.title}`);
  //console.log(req.body);
  res.redirect(`/campgrounds/${campground._id}`);

  // } catch (e) {
  //     next(e)
  // }

  // because of the catchAsync function define, which houses our main callback.
  // we can now do away with the try and catch. in all our async function.
};

module.exports.newForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "review",
      populate: {
        path: "author"
      }
    })
    .populate("author");

  if (!campground) {
    req.flash("error", "Cannot find campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { new: true }
  );
  if (req.files) {
    const imgs = req.files.map((image) => ({
      url: image.path,
      filename: image.filename
    }));
    campground.images.push(...imgs);
    await campground.save();
  }

  // if images was highlighted.
  if (req.body.deleteImages) {
    // delete image from cloudinary
    req.body.deleteImages.forEach((image) => {
      // delete each image
      cloudinary.uploader.destroy(image.filename);
    });
    //delete image from mongo
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } }
    });
  }

  req.flash(
    "success",
    `Campground - ${campground.title}, updated successfully`
  );

  res.redirect(`/campgrounds/${campground._id}`);
  //res.send('IT WORKED')
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted Campground");
  res.redirect("/campgrounds");
};
