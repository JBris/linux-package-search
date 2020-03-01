const memory = require("./providers/Memory");

providers = {};
providers[memory.getId()] = memory;
module.exports = providers;