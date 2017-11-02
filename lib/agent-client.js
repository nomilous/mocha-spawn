module.exports = AgentClient;

var debug = require('debug')('mocha-fork:agent-client');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var socketIO = require('socket.io-client');

function AgentClient(opts) {
  opts = opts || {};
  Object.defineProperty(this, 'securityToken', {
    value: opts.securityToken
  });
  Object.defineProperty(this, 'host', {
    value: opts.host
  });
  Object.defineProperty(this, 'port', {
    value: opts.port || 59595
  });
  Object.defineProperty(this, 'transports', {
    value: opts.transports || ['websocket']
  });
  Object.defineProperty(this, 'rejectUnauthorized', {
    value: typeof opts.rejectUnauthorized == 'boolean' ?
    opts.rejectUnauthorized : true
  });
  this.connected = false;
}

util.inherits(AgentClient, EventEmitter);

AgentClient.prototype.start = start;
AgentClient.prototype.stop = stop;
AgentClient.prototype._startClient = _startClient;

function start() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('start()');

    if (!_this.securityToken) return reject(
      new Error('agent-client [opts] missing securityToken')
    );

    if (!_this.host) return reject(
      new Error('agent-client [opts] missing host')
    );

    _this._startClient()

      .then(function () {
        debug('started ok');
        resolve();
      })

      .catch(reject);

  });
}

function stop() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('stop()');

    if (!this.connected) return resolve();

    _this.socket.on('disconnect', resolve);
    _this.socket.disconnect();
  });
}

function _startClient() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('_startClient()');

    function onConnectError(err) {
      reject(err);
    }

    function onConnectTimeout() {
      return reject(new Error(
        util.format('agent-client timeout connecting to %s:%s', _this.host, _this.port)
      ));
    }

    function onRunningError(err) {
      _this.emit('error', err);
    }

    function onConnect() {
      debug('connected');
      _this.connected = true;
      // resolve();
    }

    function onDisconnect() {
      debug('disconnected');
      this.connected = false;
      reject(new Error('agent-client disconnected or bad securityKey'));
    }

    var url = util.format(
      'wss://%s:%d?token=%s',
      _this.host,
      _this.port,
      _this.securityToken
    );

    debug('connecting to %s', url);

    _this.socket = socketIO(url, {
      // secure: true,
      rejectUnauthorized: _this.rejectUnauthorized,
      transports: _this.transports
    });

    _this.socket.on('connect_error', onConnectError);
    _this.socket.on('connect_timeout', onConnectTimeout);
    _this.socket.on('error', onRunningError);
    _this.socket.on('connect', onConnect);
    _this.socket.on('disconnect', onDisconnect);

    // TODO: reconnect stuff

    _this.socket.on('info', function (info) {
      debug('in groups [%s]', info.groups.join(', '));
      debug('id %s', info.id);
      _this.id = info.id;
      _this.groups = info.groups;

      resolve();
    });

  });
}
