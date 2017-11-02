var EventEmitter = require('events').EventEmitter;
var spawn = require('./spawn');
var child = require('./child');
var AgentServer = require('./agent-server');

var emitter = new EventEmitter();

module.exports = emitter;

module.exports.AgentServer = AgentServer;

module.exports.before = spawn.before;

module.exports.beforeEach = spawn.beforeEach;

module.exports.after = spawn.after;

module.exports.onStart = function (fn) {

  return child.start(fn, emitter);

};

module.exports.onStop = child.stop;

module.exports.send = function (event) {

  var args = Array.prototype.slice.apply(arguments);

  if (event == 'exit') throw new Error('cannot send exit event');

  try {

    process.send({
      action: 'message',
      args: args
    });

  } catch (error) {

    // parent is gone

  }

};
