var fs = require('fs'),
    _ = require('lodash'),
    config = {
        serverUrl: '',
        browsers: []
    };


var configPath = __dirname + '/../../config.json';

if (fs.existsSync(configPath)) {
    _.extend(config, JSON.parse(fs.readFileSync(configPath, 'utf-8')) || {});
}


fs.writeFileSync(configPath, JSON.stringify(config));

module.exports = config;