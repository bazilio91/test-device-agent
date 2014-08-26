var Agent = require('./lib/Agent');


var agent = new Agent(require('./lib/config'), require('log4js').getLogger('test-device-agent'));

module.exports = agent;