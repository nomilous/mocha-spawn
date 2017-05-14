var EventEmitter = require('events').EventEmitter;
var fork = require('./fork');
var child = require('./child');

var emitter = new EventEmitter();

module.exports = emitter;

module.exports.before = fork.before;

module.exports.beforeEach = fork.beforeEach;

// module.exports.after = fork.after;
//
// module.exports.afterEach = fork.afterEach;

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
