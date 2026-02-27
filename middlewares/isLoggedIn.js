const jwt = require("jsonwebtoken");
const UserCollection = require("../models/user");
const dotEnv = require("dotenv");
dotEnv.config();

const isLoggedIn = async (req, res, next) => {
    let token;
    try {     
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1] 
        }   
        if (!token) {
            return res.status(403).json({
                status: "error",
                message: "Please provide a token!"
            })
        }
    
        const decoded = jwt.verify(token, process.env.jwt_secret_key);
        const user = await UserCollection.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "User not found!"
            });
        }

        req.user = user         
        next();

    } catch (error) {
        console.error(error);
        next(error);
    }
}

const isAdmin = (req, res, next) => {
    if (user.role !== "admin") {
        return res.status(403).json({
            status: "error",
            message: "You must be an admin."
        })
    } else {
        console.log("You are in the admin middleware!");
        
    }
    next();
}

module.exports = {
    isLoggedIn,
    isAdmin
}
