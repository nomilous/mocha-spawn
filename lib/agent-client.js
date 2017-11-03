module.exports = AgentClient;

var debug = require('debug')('mocha-spawn:agent-client');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var socketIO = require('socket.io-client');
var shortid = require('shortid');

var Process = require('./process');

function AgentClient(opts) {
  opts = opts || {};
  this.connected = false;
  this.id = null;
  this.hostname = null;
  this.groups = null;
  this.procs = [];
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
  Object.defineProperty(this, 'socket', {
    value: null,
    writable: true
  });
}

util.inherits(AgentClient, EventEmitter);

AgentClient.prototype.start = start;
AgentClient.prototype.stop = stop;
AgentClient.prototype.isMember = isMember;
AgentClient.prototype.spawnProcess = spawnProcess;
AgentClient.prototype.killProcess = killProcess;
AgentClient.prototype._startClient = _startClient;

function start() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('starting');

    if (!_this.securityToken) return reject(
      new Error('agent-client [opts] missing securityToken')
    );

    if (!_this.host) return reject(
      new Error('agent-client [opts] missing host')
    );

    _this._startClient()

      .then(function () {
        debug('ready');
        resolve();
      })

      .catch(reject);

  });
}

function stop() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('stopping');

    if (!this.connected) return resolve();

    _this.socket.on('disconnect', resolve);
    _this.socket.disconnect();
  });
}

function isMember(group) {
  if (this.groups.indexOf('any') >= 0) return true;
  if (this.groups.indexOf(group) >= 0) return true;
  return false;
}

function spawnProcess(id, run, opts) {
  var _this = this;
  return new Promise(function (resolve, reject) {
    var proc = new Process(id, run, opts)

    debug('start %s at %s (%s)', run.script, _this.hostname, id);

    _this.procs.push(proc);

    _this.socket.once(proc.id, function (result) {
      switch (result.action) {

        case 'startError':
          var e = new Error();
          e.name = result.name;
          e.message = result.message;
          // e.stack = result.stack;

          _this.procs.splice(_this.procs.indexOf(proc), 1);
          return reject(e);

      }
    });

    _this.socket.emit(_this.id, {
      action: 'start',
      id: proc.id,
      run: run,
      opts: opts
    });
  });
}

function killProcess(id, fireAndForget) {
  var _this = this;
  return new Promise(function (resolve, reject) {
    var proc = _this.procs.find(function (proc) {
      return proc.id == id;
    });

    if (!proc) {
      debug('no such process (%s)', id);
      return resolve();
    }

    debug('kill %s at %s (%s)', proc.run.script, _this.hostname, id);

    function deleteProcess() {
      _this.procs.splice(_this.procs.indexOf(proc), 1);
    }

    if (!fireAndForget) {
      _this.socket.once(proc.id, function (result) {
        switch (result.action) {

          case 'killOk':
            deleteProcess();
            return resolve();

        }
      });
    }

    _this.socket.emit(_this.id, {
      action: 'kill',
      id: proc.id
    });

    if (fireAndForget) {
      deleteProcess();
      return resolve();
    }
  });
}

function _startClient() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('connect client');

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
      debug('TODO: LOG ON DISCONNECT WHILE RUNNING');
      debug('TODO: REJECT ON DISCONNECT WHILE STARTING');
      debug('TODO: REJECT ON DISCONNECT WHILE STOPPING');
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
      _this.hostname = info.hostname;
      _this.groups = info.groups;

      resolve();
    });
  });
}
