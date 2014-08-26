var iectrl = require('iectrl'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    config = require('../config'),
    logger = require('../logger');

var browsers = [];
_.each(iectrl.IEVM.names, function (ievm) {
    if (_.pluck(config.browsers, 'name').indexOf(ievm) === -1) {
        logger.trace('skip %s browser', ievm);
        return;
    }

    browsers.push(function (logger) {
        var browser = {
            name: ievm,
            vm: null,
            cmd: null,
            args: null,
            installing: false,
            ready: false,
            events: new EventEmitter(),
            open: function (url) {
                if (!browser.ready) {
                    browser.events.once('ready', function () {
                        browser.vm.open(url);
                    });
                } else {
                    browser.vm.open(url);
                }
                logger.debug('IEVM %s sending to vm url %s', browser.name, url);

            },
            run: function () {
                browser.events.once('ready', function () {
                    browser.ready = true;
                });

                browser.vm.running().then(function (running) {
                    if (!running) {
                        logger.debug('IEVM %s not running, starting...', browser.name);
                        browser.vm.start(true).then(function () {
                            logger.debug('IEVM %s started', browser.name);
                            browser.events.emit('ready');
                        });
                    } else {
                        browser.events.emit('ready');
                    }
                });
            },

            init: function () {
                browser.captureHostname = iectrl.IEVM.hostIp;
                browser.vm = iectrl.IEVM.find(browser.name)[0];
                if (browser.installing) {
                    return;
                }

                browser.vm.missing().then(function (missing) {
                    console.log(missing);
                    if (missing) {
                        browser.installing = true;
                        logger.warn('IEVM %s missing, installing!', browser.name);
                        browser.vm.install().then(function () {
                            logger.info('IEVM %s installed!', browser.name);
                            browser.installing = false;
                            browser.events.emit('installed');
                        });
                    } else {
                        browser.run();
                    }
                });
            }
        };

        browser.init();

        return browser;
    });
});

module.exports = browsers;