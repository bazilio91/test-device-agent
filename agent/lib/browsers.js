var _ = require('lodash'),
    config = require('./config'),
    logger = require('./logger'),
    browserTemplates = _.extend(require('./browsers_templates')(logger), require(config.browsersPath + '/index.js')(logger));

var loadedBrowsers = _.map(config.browsers, function (browserCfg) {
    if (browserCfg.cmd) {
        return browserCfg;
    } else {
        if (browserTemplates[browserCfg.name]) {
            if (typeof browserTemplates[browserCfg.name] === 'function') {
                return new browserTemplates[browserCfg.name](logger);
            } else {
                return browserTemplates[browserCfg.name];
            }
        } else {
            throw new Error('Unknown browser ' + browserCfg.name)
        }
    }
});

module.exports = loadedBrowsers;