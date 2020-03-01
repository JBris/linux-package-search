const debian = require('./providers/Debian');
const fedora = require('./providers/Fedora');

providers = {};
providers[debian.getId()] = debian;
providers[fedora.getId()] = fedora;

module.exports = providers;