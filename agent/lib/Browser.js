var spawn = require('child_process').spawn,
    http = require('http'),
    _ = require('lodash'),
    os = require('os'),
    io = require('socket.io-client'),
    EventEmitter = require('events').EventEmitter;

var Browser = function (options, logger) {
    var browser = this;

    this.events = new EventEmitter();
    this.userAgent = false;
    this.socket = null;
    _.extend(this, options);

    function onServerHello() {
        logger.trace('Sending client_hello for %s', browser.name);
        browser.socket.emit('client_hello', {'user_agent': browser.userAgent});
        browser.events.emit('connected');
    }

    function onServerRedirect(data) {
        logger.info('Server redirect: %s', data.url);
        browser.open(data.url);
        browser.events.emit('redirect', data.url);
    }

    this.open = function (url, returnUrl) {
        var args = _.result(browser, 'args'),
            urlInArgs = false;

        url = url + (returnUrl ? '?return_url=' + returnUrl : '');

        _.each(args, function (arg, i) {
            if (arg === '%url%') {
                args[i] = url;
                urlInArgs = true;
            }
        });

        if (!urlInArgs) {
            args.push(url);
        }

        return spawn(_.result(options, 'cmd'), args);
    };

    this.check = function (cb) {
        var browserProcess = null;
        var server = http.createServer(function (req, res) {
            if (req.url === '/favicon.ico') {
                res.writeHead(404);
                res.end();
            }

            browser.userAgent = req.headers['user-agent'] + ' @ ' + os.hostname();
            res.end();
            browserProcess.kill();
            server.close();

            browser.events.emit('checked');
            logger.info('Browser %s checked & ready.', browser.name);
            cb(browser);
        }).listen(function () {
            var address = server.address();

            // windows is pretty stupid, and doesn't understand 0.0.0.0
            browserProcess = browser.open('http://localhost:' + address.port + '/');
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