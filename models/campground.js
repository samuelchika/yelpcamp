const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const User = require('./user')

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    review: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (data) {
    // if something was deleted, then the following will run
    if(data) {
        await Review.deleteMany({
            _id: {
                $in: data.review
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);