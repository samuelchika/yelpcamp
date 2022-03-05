const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
//const User = require("./user");

const ImageSchema = new Schema({
  url: String,
  filename: String
});

// set the virtual to return thumbnail for our images display.
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("upload", "upload/w_200");
});

const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review"
      }
    ]
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <a href="/campgrounds/${this._id}">${this.title}</a>
  <p>${this.description.substring(0, 30)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (data) {
  // if something was deleted, then the following will run
  if (data) {
    await Review.deleteMany({
      _id: {
        $in: data.review
      }
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
