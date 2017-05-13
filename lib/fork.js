var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;
var children = {};

module.exports.start = function (script, opts) {

  var emitter = new EventEmitter();

  before('start ' + script, function (done) {

    var child = children[script] = child_process.fork(script);

    var onExit = function (code) {

      done(new Error('Exited unexpectedly with code ' + code));

    };

    child.once('exit', onExit);

    child.on('exit', function (code, signal) {

      emitter.emit('exit', code, signal);

    });

    child.on('message', function (message) {

      var error;

      switch (message.action) {

        case 'started':

          child.removeListener('exit', onExit);
          done();
          break;

        case 'startError':

          child.removeListener('exit', onExit);
          error = new Error();
          error.name = message.name;
          error.message = message.message;
          done(error);
          break;

        case 'message':

          emitter.emit('message', message.data);
          break;

      }

    });

    child.send({
      action: 'start',
      opts: opts
    });

  });

  return emitter;

};

module.exports.stop = function (script) {

  after('stop ' + script, function (done) {

    var child = children[script];

    if (!child) return done();

    child.on('exit', function () {

      // wait for a clean exit from the child (without kill)

      done();

    });

    child.on('message', function (message) {

      var error;

      switch (message.action) {

        case 'stopError':
          error = new Error();
          error.name = message.name;
          error.message = message.message;
          done(error);
          break;

      }

    });

    child.send({
      action: 'stop'
    });

  });

};

module.exports.kill = function (script) {

  after('kill ' + script, function (done) {

    var child = children[script];

    if (!child) return done();

    child.on('exit', function () {

      done();

    });

    child.kill();

  });

};
