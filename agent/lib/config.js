var fs = require('fs'),
    isNodeWebkit = false,
    _ = require('lodash'),
    browserTemplates = require('./browsers_templates'),
    config = {
        serverUrl: '',
        browsers: []
    };

try {
    isNodeWebkit = (typeof process.versions['node-webkit'] !== "undefined");
} catch (e) {
    isNodeWebkit = false;
}

function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

var configPath = __dirname + '/../../',
    browsersPath = __dirname + '/../../browsers';

if (isNodeWebkit) {
    configPath = getUserHome() + '/.test-device-agent';

    if (!fs.existsSync(configPath)) {
        fs.mkdirSync(configPath);
    }

    if (!fs.existsSync(browsersPath)) {
        fs.mkdirSync(browsersPath);
    }
}

fs.writeFileSync(browsersPath + '/index.js', fs.readFileSync(__dirname + '/browsers_templates/index.js'));


if (fs.existsSync(configPath + '/config.json')) {
    _.extend(config, JSON.parse(fs.readFileSync(configPath + '/config.json', 'utf-8')) || {});
}

fs.writeFileSync(configPath + '/config.json', JSON.stringify(config));

if (!config.serverUrl) {
    throw new Error('config.serverUrl not set!');
}

browserTemplates = _.extend(browserTemplates, require(browsersPath + '/index.js'));


var loadedBrowsers = _.map(config.browsers, function (browserCfg) {
    if (browserCfg.cmd) {
        return browserCfg;
    } else {
        if (browserTemplates[browserCfg.name]) {
            return browserTemplates[browserCfg.name];
        } else {
            throw new Error('Unknown browser ' + browserCfg.name)
        }
    }
});

var exportConfig = config;
exportConfig.browsers = loadedBrowsers;

module.exports = exportConfig;