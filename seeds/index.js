const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors, images } = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// sample is a function that takes in an array and returns a random integer with regards to the length of the array
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: images[i],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ex quasi adipisci minima hic dolores debitis nulla obcaecati beatae at ab, qui quo facere, sed quod. Tempore quas dignissimos vero adipisci.',
            price
        });
        await camp.save();
    }
}

// because it return a promise, we have to close the connection using the then and a connection close
seedDB().then(() => {
    mongoose.connection.close();
})