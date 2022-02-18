const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');

// validate campground input

const validateCampground = (res, req, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

  // create link to campground
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));
// get the post form for new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {
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
    await campground.save();
    // we are inputing the flash message here
    req.flash('success',`Successfully created Campground: ${campground.title}`);
    //console.log(req.body);
    res.redirect(`/campgrounds/${ campground._id }`);
    // } catch (e) {
    //     next(e)
    // }
    

    // because of the catchAsync function define, which houses our main callback.
    // we can now do away with the try and catch. in all our async function.
}))
// create new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
// visit one campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'review',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// edit campground
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', 'Cannot find campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));
// update campground
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    req.flash('success',`Campground - ${campground.title}, updated successfully`);
    res.redirect(`/campgrounds/${campground._id}`);
    //res.send('IT WORKED')

}));
// delete a campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
   const { id } = req.params;
   await Campground.findByIdAndDelete(id);
   req.flash('success', 'Successfully deleted Campground');
   res.redirect('/campgrounds');
}));


module.exports = router;