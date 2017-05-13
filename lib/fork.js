var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;
var children = {};

['before', 'beforeEach', 'after', 'afterEach'].forEach(function (hook) {

  module.exports[hook] = {};

  module.exports[hook].start = function (script, opts) {

    return start(hook, script, opts);

  };

  module.exports[hook].stop = function (script, opts) {

    return stop(hook, script, opts);

  };

  module.exports[hook].kill = function (script, opts) {

    return kill(hook, script, opts);

  };

});

function start(hook, script, opts) {

  var emitter = new EventEmitter();
  var child;

  global[hook]('start ' + script, function (done) {

    var onExit = function (code) {

      done(new Error('Child exited unexpectedly with code ' + code + ', perhaps missing onStart()'));

    };

    child = children[script] = child_process.fork(script);

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

          emitter.emit(message.event, message.data);
          break;

      }

    });

    child.send({
      action: 'start',
      opts: opts
    });

  });

  emitter.send = function (event, data) {

    if (!child) return;

    try {

      process.kill(child.pid, 0);

    } catch (error) {

      return;

    }

    child.send({
      action: 'message',
      event: event,
      data: data
    });

  };

  return emitter;

}


function stop(hook, script) {

  global[hook]('stop ' + script, function (done) {

    var child = children[script];

    if (!child) return done();

    try {

      process.kill(child.pid, 0);

    } catch (error) {

      // child is already stopped
      return done();

    }

    child.on('exit', function () {

      // wait for a clean exit from the child (without kill)
      delete children[script];
      done();

    });

    child.on('message', function (message) {

      var error;

      switch (message.action) {

        case 'stopError':
          error = new Error();
          error.name = message.name;
          error.message = message.message;

          // child.on('exit', function () {
          //   done(error);
          // });
          //
          // child.kill();

          done(error);
          break;

      }

    });

    child.send({
      action: 'stop'
    });

  });

}

function kill(hook, script) {

  global[hook]('kill ' + script, function (done) {

    var child = children[script];

    if (!child) return done();

    try {

      process.kill(child.pid, 0);

    } catch (error) {

      // child not running
      return done()

    }

    child.on('exit', function () {

      done();

    });

    child.kill();

  });

}
