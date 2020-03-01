const debian = require('./providers/Debian');
const fedora = require('./providers/Fedora');
const ubuntu = require('./providers/Ubuntu');

providers = {};
providers[debian.getId()] = debian;
providers[fedora.getId()] = fedora;
providers[ubuntu.getId()] = ubuntu;

module.exports = providers;