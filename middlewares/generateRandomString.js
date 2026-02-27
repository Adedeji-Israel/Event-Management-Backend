const crypto = require('crypto');

const generateRandomString = (num) => {
    const string = crypto.randomBytes(num).toString("hex");
    return string;
};

module.exports = generateRandomString 
