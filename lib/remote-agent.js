module.exports = RemoteAgent;

var debug = require('debug')('mocha-fork:remote-agent');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var socketIO = require('socket.io');
var https = require('https');
var pem = require('pem');

function RemoteAgent(options) {
  options = options || {};
  Object.defineProperty(this, 'apikey', {
    value: options.apikey || 'apikey'
  });
  Object.defineProperty(this, 'groups', {
    value: options.groups || ['any']
  });
  Object.defineProperty(this, 'host', {
    value: options.host || 'localhost'
  });
  Object.defineProperty(this, 'port', {
    value: options.port || 59595
  });
  Object.defineProperty(this, 'key', {
    value: options.key || null,
    writable: true
  });
  Object.defineProperty(this, 'cert', {
    value: options.cert || null,
    writable: true
  });
}

util.inherits(RemoteAgent, EventEmitter);

RemoteAgent.prototype.start = start;

RemoteAgent.prototype._ensureCertificate = _ensureCertificate;
RemoteAgent.prototype._startServer = _startServer;
RemoteAgent.prototype._configureServer = _configureServer;
RemoteAgent.prototype._onConnection = _onConnection;


function start() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('start()');

    _this._ensureCertificate()
      .then(function () {
        return _this._startServer();
      })
      .then(function () {
        return _this._configureServer();
      })
      .then(resolve)
      .catch(reject);
  });
}

function _ensureCertificate() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    if (this.key && this.cert) return resolve();

    debug('_ensureCertificate()');
    pem.createCertificate({
      selfSigned: true
    }, function (err, keys) {
      if (err) return reject(err);

      debug('created certificate');
      _this.key = keys.serviceKey;
      _this.cert = keys.certificate;
      resolve();
    });
  });
}

function _startServer() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('_startServer()');

    function onListenError(err) {
      reject(err);
    }

    function onRunningError(err) {
      _this.emit('error', err);
    }

    function onListening() {
      var addr = _this.server.address();
      debug('started server %s:%d', addr.address, addr.port);
      _this.server.removeListener('error', onListenError);
      _this.server.on('error', onRunningError);
      resolve();
    }

    _this.server = https.createServer({
      key: _this.key,
      cert: _this.cert
    }, function (req, res) {
      res.writeHead(200);
      res.end('OK');
    });

    _this.io = socketIO(_this.server);
    _this.server.on('error', onListenError);
    _this.server.on('listening', onListening);
    _this.server.listen(_this.port, _this.host);
  });
}

function _configureServer() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('_configureServer()');

    _this.io.on('error', function (err) {
      _this.emit('error', err);
    });

    _this.io.on('connection', _this._onConnection.bind(_this));

    resolve();
  });
}

function _onConnection(socket) {
  
}
