const memory = require("./providers/Memory");
const redis = require("./providers/Redis");

providers = {};
providers[memory.getId()] = memory;
providers[redis.getId()] = redis;
module.exports = providers;