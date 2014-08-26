var async = require('async'),
    http = require('http'),
    _ = require('lodash'),
    Browser = require('./Browser'),
    EventEmitter = require('events').EventEmitter;

var Agent = function (config, logger) {
    this.events = new EventEmitter();
    var browsers = this.browsers = _.map(config.browsers, function (options) {
            return new Browser(options, logger);
        }),
        agent = this;

    this.check = function (checkCallback) {
        async.each(browsers, function (browser, cb) {
            browser.check(cb);
        }, function () {
            if (checkCallback) {
                checkCallback(browsers);
            }

            agent.events.emit('checked', browsers);
        });
    };


    this.start = function () {
        logger.debug('Starting sockets');
        async.each(browsers, function (browser) {
            browser.listen(config.serverUrl)
        }, function () {
            agent.events.emit('started');
        });
    };

    this.events.on('checked', this.start);
    this.check();

};

module.exports = Agent;