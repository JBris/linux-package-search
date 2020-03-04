const linuxProviders = require("../services/linux/providers");
const cacheProviders = require("../services/cache/providers");
const NODE_ENV = process.env.NODE_ENV || "development";

const defaults = {
    NODE_ENV: NODE_ENV,
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || '0.0.0.0',
    NODE_API_SECRET: process.env.NODE_API_SECRET || "YourSecretHere",
    DB_USER: process.env.DB_USER || 'user',
    DB_PASSWORD: process.env.DB_PASSWORD || 'pass',
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_PORT: process.env.DB_PORT || '5432',
    DB_NAME: process.env.DB_NAME || 'linux_packages',
    NODE_DB_CLIENT: process.env.NODE_DB_CLIENT || 'pg',
    NODE_RATE_LIMIT_REQUESTS: process.env.NODE_RATE_LIMIT_REQUESTS || 1000,
    NODE_RATE_LIMIT_RESET: process.env.NODE_RATE_LIMIT_RESET || 600000,
    NODE_CACHE_BACKEND: process.env.NODE_CACHE_BACKEND || "memory",
    NODE_CACHE_LIFETIME: process.env.NODE_CACHE_LIFETIME || 3600,
    LINUX_SEARCH_PROVIDERS: linuxProviders,
    CACHE_BACKEND_PROVIDERS: cacheProviders,
};

let config = {};
config.development = defaults;
config.uat = defaults;
config.production = defaults;

//Override config here...

exports.get = () => {    
    if (typeof config[NODE_ENV] === 'undefined') {
        return config.development;
    } else {
        return config[NODE_ENV];
    }
}
