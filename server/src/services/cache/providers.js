const NODE_CACHE_BACKEND = process.env.NODE_CACHE_BACKEND;

const memory = require("./providers/Memory");
let redis;
if (NODE_CACHE_BACKEND === 'redis') { redis = require("./providers/Redis"); } 

providers = {};
providers[memory.getId()] = memory;
if (NODE_CACHE_BACKEND === 'redis') { providers[redis.getId()] = redis; } 
module.exports = providers;