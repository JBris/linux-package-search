const rateLimit = require("express-rate-limit");
  
exports.create = (options) => {
    if (typeof options.message === "undefined") {
        options.message = { 
            error: 1, 
            message: "Too many requests from this IP. Please try again later." 
        }
    };

    return rateLimit(options);
} 