require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// middlewares
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { urlencoded } = require('express');
const methodOverride = require('method-override');
// import campground model
const Campground = require('./models/campground');
const User = require('./models/user');
// const { campgroundSchema, reviewSchema } = require('./schema.js');
// const review = require('./models/review');

// defining our routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

// create our express contructor
const app = express();

// set up our console port
const port = process.env.PORT || 3000;
//mongoose.connect('mongodb://localhost:27017/yelp-camp');
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
    
/*
When using middleware is when you will use the app.use()
when setting some functionality, we use the app.set()
*/
// tell express our express should use the ejs-mate and not the default ejs
app.engine('ejs', ejsMate);
//set the view engine
app.set('view engine', 'ejs');
//set the path for the view folder to be used for the ejs files.
app.set('views', path.join(path.resolve(), 'views'));

// set up a middleware for bodyparser
app.use(express.urlencoded({extended: true}));
// set up the middleware methodOverride
app.use(methodOverride('_method'));
// app.use(express.static('public'));

app.use(express.static(path.join(path.resolve(), 'public')));

// session
const sessionConfig = {
    httpOnly: true,
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() + 1000 * 60* 60 * 24 * 7,
        maxAge: 1000 * 60* 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

// flash
app.use(flash());

// we are trying to use passport, we have to initialize it and allow it to use session
// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// we now have to add the strategy to use - local / google / facebook etc
passport.use(new LocalStrategy(User.authenticate()));

// we now have to serialize and deserialize users
// this create a session after authenticating user.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// we have to make the flash message global. so it can be accessed from anywhere in our program.
app.use((req, res, next) => {
    console.log(req.user);
    // add the user object from passport into the res.locals to control user signing session
    // console.log(req.user);
    res.locals.currentUser = req.user;
    // this sets the success object key of the res.locals as a flash message if defined in any route.
    // take a look at the create campground post for example.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// using our routes
app.use('/', users);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);


// we have to connect mongodb
// name of our db is yelp-camp
app.get('/', (req, res) => {
    res.render('home')
    //res.send('This is our Yelp app');
})


// a 404 error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})



// error handling
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something went wrong';
    res.status(statusCode).render('error', { err });
    //console.log(err);
})
// open the port for express on 
app.listen(port, () => {
    console.log('Running express app on port 3000');
});