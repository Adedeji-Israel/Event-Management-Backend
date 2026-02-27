
const handleValidationError = (err, res) => {
    // METHOD 1 
    const errorMessages = Object.values(err.errors).map(error => error.message);
    console.log(errorMessages);

    res.status(400).json({
        status: "error",
        message: errorMessages[0] // Send only the first error message
    });

    // METHOD 2 
    // const errorValues = Object.values(err.errors);
    // const errorKind = errorValues.map(error => error.kind)[0]; 
    // const sentKind = errorValues.map(error => error.valueType)[0]; 
    // const errorPath = errorValues.map(error => error.path)[0]; 
    // // console.log("errorValues: ", errorValues);

    // const errorMessage = `You sent ${sentKind} instead of ${errorKind} to the ${errorPath} field.`

    // res.status(400).json({
    //     status: "error",
    //     message: errorMessage 
    // })    
};

const handleCastError = (err, res) => {
    const message = `${err.path} of '${err.value}' is not valid!`;

    return res.status(400).json({
        status: "error",
        message: message 
    });
};

const handleDuplicateError = (err, res) => {
    const errorKey = Object.keys(err.keyValue)[0];
    const errorValue = Object.values(err.keyValue)[0];

    const message = `${errorKey} of ${errorValue} already exists! Use another ${errorKey}`;

    return res.status(403).json({
        status: "error",
        message: message
    });
};

const handleInvalidToken = (err, res) => {
    return res.status(400).json({
        status: "error",
        message: `Please provide a valid token!`
    });
};

const handleExpiredToken = (err, res) => {
    return res.status(400).json({
        status: "error",
        message: `Token has expired. Please log in again.`
    });
};

const errorHandler = (err, req, res, next) => {
    if (err.code === 11000) {
        console.log("DUPLICATE ERROR OCCURRED ...");
        return handleDuplicateError(err, res);
    } 
    else if (err.name === "CastError") {
        console.log("CAST ERROR OCCURRED ...");
        return handleCastError(err, res);
    } 
    else if (err.name === "ValidationError") {
        console.log("VALIDATION ERROR OCCURRED ...");
        return handleValidationError(err, res);
    } 
    else if (err.name === "JsonWebTokenError") {
        console.log("INVALID TOKEN ERROR OCCURRED ...");
        return handleInvalidToken(err, res);
    } 
    else if (err.name === "TokenExpiredError") {
        console.log("EXPIRED TOKEN ERROR OCCURRED ...");
        return handleExpiredToken(err, res);
    } 
    else{
        // Handle other unknown errors gracefully
        console.error("NOT HANDLED ERROR: ", err);

        res.status(500).json({
            status: "error",
            message: "Something went wrong, please try again later!"
        });
    }
    
    next();
};

module.exports = errorHandler;
