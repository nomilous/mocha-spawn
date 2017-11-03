module.exports = AgentServer;

var debug = require('debug')('mocha-spawn:agent-server');
var EventEmitter = require('events').EventEmitter;
var https = require('https');
var util = require('util');
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');

var socketIO = require('socket.io');
var pem = require('pem');

var Process = require('./process');

function AgentServer(options) {
  options = options || {};
  Object.defineProperty(this, 'path', {
    value: options.path
  });
  Object.defineProperty(this, 'securityToken', {
    value: options.securityToken
  });
  Object.defineProperty(this, 'groups', {
    value: options.groups || ['any']
  });
  Object.defineProperty(this, 'host', {
    value: options.host || '0.0.0.0'
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
  Object.defineProperty(this, 'sockets', {
    value: []
  });
}

util.inherits(AgentServer, EventEmitter);

AgentServer.prototype.start = start;
AgentServer.prototype.stop = stop;

AgentServer.prototype._ensureCertificate = _ensureCertificate;
AgentServer.prototype._startServer = _startServer;
AgentServer.prototype._configureServer = _configureServer;
AgentServer.prototype._onConnection = _onConnection;
AgentServer.prototype._onDisconnect = _onDisconnect;
AgentServer.prototype._onMessage = _onMessage;
AgentServer.prototype._doProcessStart = _doProcessStart;
AgentServer.prototype._doProcesskill = _doProcesskill;
AgentServer.prototype._fixScriptPath = _fixScriptPath;
AgentServer.prototype._killAllProcesses = _killAllProcesses;

function start() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    debug('starting server');

    if (!_this.path) return reject(
      new Error('agent-server [opts] missing path')
    );

    if (!_this.securityToken) return reject(
      new Error('agent-server [opts] missing securityToken')
    );

    _this._ensureCertificate()
      .then(function () {
        return _this._startServer();
      })
      .then(function () {
        return _this._configureServer();
      })
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

    var socket;

    if (_this.server) _this.server.close();

    while (socket = _this.sockets.pop()) {
      socket.disconnect();
    }

    resolve();

  });
}

function _ensureCertificate() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    if (_this.key && _this.cert) {
      debug('using provided certificate');
      return resolve();
    }

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
    function onListenError(err) {
      reject(err);
    }

    function onRunningError(err) {
      _this.emit('error', err);
    }

    function onListening() {
      var addr = _this.server.address();
      debug('started https server %s:%d', addr.address, addr.port);
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
    _this.io.on('error', function (err) {
      _this.emit('error', err);
    });

    _this.io.on('connection', _this._onConnection.bind(_this));

    resolve();
  });
}

function _onConnection(socket) {
  var _this = this;

  debug('connected %s from %s', socket.id, socket.handshake.address);

  if (socket.handshake.query.token !== this.securityToken) {
    return socket.disconnect(true);
  }

  this.sockets.push(socket);
  socket.procs = [];

  socket.on('disconnect', function () {
    _this._onDisconnect(socket);
  });

  socket.on(socket.id, function (action) {
    _this._onMessage(socket, action);
  });

  socket.emit('info', {
    id: socket.id,
    groups: this.groups
  });
}

function _onDisconnect(socket) {
  debug('disconnect %s', socket.id);
  this.sockets.splice(this.sockets.indexOf(socket), 1);
  this._killAllProcesses(socket);
}

function _onMessage(socket, msg) {
  switch (msg.action) {

    case 'start':
      this._doProcessStart(socket, msg);
      break;

    case 'kill':
      this._doProcesskill(socket, msg);
      break;

  }
}

function _doProcessStart(socket, msg) {
  debug('starting process %s %s at %s', msg.id, msg.run.script, socket.id);
  var _this = this;
  var proc;
  var child;
  var script;

  // action: 'start',
  // id: proc.id,
  // run: run,
  // opts: opts

  script = _this._fixScriptPath(msg.run.script);

  if (!fs.existsSync(script)) {
    debug('missing %s (%s)', script, msg.id);
    return socket.emit(msg.id, {
      action: 'startError',
      id: msg.id,
      name: 'Error',
      message: util.format('Missing remote script %s', script),
    })
  }

  proc = new Process(msg.id, msg.run, msg.opts);
  socket.procs.push(proc);

  function onExit(code, error) {
    debug('process %s (%s) exited with code %d',
      msg.run.script, msg.id, code);

    socket.emit(proc.id, {
      action: 'startError',
      id: proc.id,
      name: 'Error',
      message: util.format(
        'Remote child exited immediately with code %d, perhaps missing onStart()',
        code
      )
    });

    socket.procs.splice(socket.procs.indexOf(proc), 1);
  }

  child = proc._child = child_process.fork(script);

  child.once('exit', onExit);

  child.send({
    action: 'start',
    opts: proc.opts
  });
}

function _doProcesskill(socket, msg) {
  var proc = socket.procs.find(function (proc) {
    return proc.id == msg.id;
  });

  function respondKillOk() {
    socket.emit(proc.id, {
      action: 'killOk'
    });
  }

  function deleteProcess() {
    socket.procs.splice(socket.procs.indexOf(proc), 1);
  }

  if (!proc) {
    debug('no such process (%s)', msg.id);
    respondKillOk();
    return;
  }

  try {
    process.kill(proc._child.pid, 0);
  } catch (error) {
    // child not running
    debug('process not running %s (%s)', proc.run.script, msg.id);
    deleteProcess();
    respondKillOk();
    return;
  }

  debug('kill process %s (%s)', proc.run.script, msg.id);

  proc._child.once('exit', function () {
    debug('killed process %s (%s)', proc.run.script, msg.id);
    deleteProcess();
    respondKillOk();
  });

  proc._child.kill();
}

function _fixScriptPath(script) {
  // allow for win32
  var parts = script.split('/');
  parts.unshift(this.path);
  var fixed = path.resolve.apply(null, parts);
  if (!fixed.substring(fixed.length - 3) != '.js') {
    fixed += '.js';
  }
  return fixed;
}

function _killAllProcesses(socket) {
  debug('TODO: KILL ALL PROCS FOR SOCKET');
}
