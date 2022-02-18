module.exports.isLoggedIn = (req, res, next) => {
    const requestUrl = req.originalUrl;
    req.session.requestUrl = req.originalUrl;
    // console.log(requestUrl)
    if(!req.isAuthenticated()) {
        // user is not loggedIn
        req.flash('error', 'You must be login');
        return res.redirect('/login')
    }
    next();
}