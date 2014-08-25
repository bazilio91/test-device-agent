var spawn = require('child_process').spawn,
    http = require('http'),
    _ = require('lodash'),
    io = require('socket.io-client');

var Browser = function (options, logger) {
    var browser = this;

    this.userAgent = false;
    this.socket = null;
    _.extend(this, options);

    function onServerHello() {
        logger.trace('Sending client_hello for %s', browser.name);
        browser.socket.emit('client_hello', {'user_agent': browser.userAgent});
    }

    function onServerRedirect(data) {
        logger.info('Server redirect: %s', data.url);
        browser.open(data.url);
    }

    this.open = function (url, returnUrl) {
        var args = browser.args;
        args.push(url + (returnUrl ? '?return_url=' + returnUrl : ''));

        return spawn(options.cmd, args);
    };

    this.check = function (cb) {
        var browserProcess = null;
        var server = http.createServer(function (req, res) {
            if (req.url === '/favicon.ico') {
                res.writeHead(404);
                res.end();
            }

            browser.userAgent = req.headers['user-agent'];
            res.end();
            browserProcess.kill();
            server.close();


            logger.info('Browser %s checked & ready.', browser.name);
            cb(browser);
        }).listen(function () {
            var address = server.address();
            browserProcess = browser.open('http://' + address.address + ':' + address.port + '/');
        });
    };

    this.listen = function (url) {
        logger.trace('Browser %s connecting to %s', browser.name, url);
        var socket = browser.socket = io.connect(url);

        socket.on('server_hello', onServerHello);
        socket.on('redirect', onServerRedirect);
        socket.on('message', function (data) {
            logger.trace('Browser %s message: %s', browser.name, JSON.stringify(data));
        });
    }
};

module.exports = Browser;