var fs = require('fs'),
    isNodeWebkit = false,
    _ = require('lodash'),
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

var configPath = __dirname + '/../../config.json';

if (isNodeWebkit) {
    configPath = getUserHome() + '/.test-device-agent.json'
}

if (fs.existsSync(configPath)) {
    _.extend(config, JSON.parse(fs.readFileSync(configPath, 'utf-8')) || {});
}

fs.writeFileSync(configPath, JSON.stringify(config));

module.exports = config;