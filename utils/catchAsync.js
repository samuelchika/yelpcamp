module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}

// if it catches an error, it will redirect to the error portion of the code