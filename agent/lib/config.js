var fs = require('fs'),
  isNodeWebkit = false,
  _ = require('lodash'),
  logger = require('./logger'),
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

var configPath = __dirname + '/../..',
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
config.browsersPath = browsersPath;

fs.writeFileSync(browsersPath + '/index.js', fs.readFileSync(__dirname + '/browsers_templates/index.js'));


if (fs.existsSync(configPath + '/config.json')) {
  logger.debug('Loading config from %s', configPath + '/config.json');
  _.extend(config, JSON.parse(fs.readFileSync(configPath + '/config.json', 'utf-8')) || {});
}

logger.debug('Saving config to %s', configPath + '/config.json');
fs.writeFileSync(configPath + '/config.json', JSON.stringify(config));

if (!config.serverUrl) {
  throw new Error('config.serverUrl not set!');
}

module.exports = config;