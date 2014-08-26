var Agent = require('./lib/Agent');


var agent = new Agent(require('./lib/config'), require('./lib/logger'));

module.exports = agent;