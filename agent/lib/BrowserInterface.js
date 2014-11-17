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
  this.process = null;
  this.busy = false;

  function onServerHello() {
    logger.trace('%s: Sending client_hello', browser.name);
    browser.socket.emit('client_hello', {'user_agent': browser.userAgent});
    browser.events.emit('connected');
  }

  function onServerRedirect(data) {
    var returnUrl = 'http://' + browser.captureHostname + ':' + browser.returnServerPort + '/';

    data.url += (data.url.indexOf('?') === -1 ? '?' : '&') + 'return_url=' + returnUrl;

    logger.info('%s: Server redirect: %s', browser.name, data.url);
    browser.open(data.url);
    browser.events.emit('redirect', data.url);
  }

  function onServerDisconnect() {
    console.log(arguments);
    logger.warn('%s: Lost connection to server', browser.name);
  }

  function listen(url) {
    logger.trace('%s: Connecting to %s', browser.name, url);
    var socket = browser.socket = io.connect(url, {'force new connection': true});
    socket.on('server_hello', onServerHello);
    socket.on('redirect', onServerRedirect);
    socket.on('disconnect', onServerDisconnect);
    socket.on('message', function (data) {
      logger.trace('%s: Message: %s', browser.name, JSON.stringify(data));
    });
  }

  this.init = function () {
    browser.returnHandler();
    browser.events.on('returnHandler', function () {
      browser.events.emit('init');
    });
  };

  this.connect = function () {
    browser.socket.connect();
  };

  this.disconnect = function () {
    browser.socket.close();
  };

  this.open = function (url) {
    browser.busy();
    var args = _.result(browser, 'args'),
      urlInArgs = false;

    _.each(args, function (arg, i) {
      if (arg === '%url%') {
        args[i] = url;
        urlInArgs = true;
      }
    });

    if (!urlInArgs) {
      args.push(url);
    }

    logger.info('%s: Processed url: %s', browser.name, url);

    this.process = spawn(_.result(options, 'cmd'), args);
  };

  this.busy = function () {
    if (browser.busy) {
      return;
    }

    browser.busy = true;
    browser.disconnect();
  };

  this.free = function () {
    if (!browser.busy) {
      return;
    }

    browser.connect();
    browser.busy = false;
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

      browser.kill();
      server.close();

      browser.checked = true;
      logger.info('%s: checked & ready.', browser.name);
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

  this.returnHandler = function () {
    var server = http.createServer(function (req, res) {
      if (req.url === '/favicon.ico') {
        res.writeHead(404);
        res.end();
      }
      res.write(checkFile + '\n');
      res.end();
      browser.kill();
    }).listen(function () {
      browser.returnServerPort = server.address().port;
      logger.info('%s: Return handler server started', browser.name);
      browser.events.emit('returnHandler');
    });
  };

  this.kill = function () {
    if (browser.process) {
      logger.info('%s: Killing.', browser.name);
      browser.process.kill();
    }
  };

  _.extend(this, options);
};

module.exports = BrowserInterface;