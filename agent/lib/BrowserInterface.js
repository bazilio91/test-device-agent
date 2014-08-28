var spawn = require('child_process').spawn,
  http = require('http'),
  _ = require('lodash'),
  os = require('os'),
  fs = require('fs'),
  io = require('socket.io-client'),
  EventEmitter = require('events').EventEmitter;

var checkFile = fs.readFileSync(__dirname + '/assets/check.html');

var BrowserInterface = function (options, logger) {
  var browser = this;

  this.events = new EventEmitter();
  this.userAgent = false;
  this.socket = null;
  this.checked = false;
  this.captureHostname = 'localhost';

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

  function onServerDisconnect() {
    console.log(arguments);
    logger.warn('%s lost connection to server', browser.name);
  }

  function listen(url) {
    logger.trace('Browser %s connecting to %s', browser.name, url);
    var socket = browser.socket = io.connect(url, {'force new connection': true});
    socket.on('server_hello', onServerHello);
    socket.on('redirect', onServerRedirect);
    socket.on('disconnect', onServerDisconnect);
    socket.on('message', function (data) {
      logger.trace('Browser %s message: %s', browser.name, JSON.stringify(data));
    });
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
      res.write(checkFile + '\n');
      res.end();

      if (browserProcess) {
        browserProcess.kill();
      }

      server.close();

      browser.checked = true;
      logger.info('Browser %s checked & ready.', browser.name);
      browser.events.emit('checked');

      cb(browser);
    }).listen(function () {
      var address = server.address();

      browserProcess = browser.open('http://' + browser.captureHostname + ':' + address.port + '/');
    });
  };

  this.listen = function (url) {
    if (browser.checked) {
      listen(url);
    } else {
      browser.events.once('checked', function () {
        listen(url);
      });
    }
  };

  _.extend(this, options);
};

module.exports = BrowserInterface;