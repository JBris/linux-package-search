const debian = require('./providers/Debian');

providers = {};
providers[debian.getId()] = debian;

module.exports = providers;