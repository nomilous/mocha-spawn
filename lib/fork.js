var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;

module.exports.before = {

  start: function (script, opts) {

    return start('before', script, opts);

  }

};

module.exports.beforeEach = {

  start: function (script, opts) {

    return start('beforeEach', script, opts);

  }

};

function start(hook, script, opts) {

  var emitter = new EventEmitter();
  var child;
  var getChild;
  var afterHook;

  global[hook]('start ' + script, function (done) {

    var onExit = function (code) {

      done(new Error('Child exited unexpectedly with code ' + code + ', perhaps missing onStart()'));

    };

    child = emitter._child = child_process.fork(script);

    child.once('exit', onExit);

    child.on('exit', function (code, signal) {

      emitter.emit('exit', code, signal);

      delete emitter._child;

    });

    child.on('message', function (message) {

      var error;

      switch (message.action) {

        case 'started':

          child.removeListener('exit', onExit);
          done();
          return;

        case 'startError':

          child.removeListener('exit', onExit);
          error = new Error();
          error.name = message.name;
          error.message = message.message;
          done(error);
          return;

        case 'message':

          emitter.emit.apply(emitter, message.args);
          return;

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

  getChild = function () {

    return child;

  };

  afterHook = hook == 'before' ? 'after' : 'afterEach';

  emitter[afterHook] = {

    stop: function () {

      return stop(afterHook, script, getChild);

    },

    kill: function () {

      return kill(afterHook, script, getChild);

    }

  };

  return emitter;

}


function stop(hook, script, getChild) {

  global[hook]('stop ' + script, function (done) {

    var child = getChild();

    if (!child) return done();

    try {

      process.kill(child.pid, 0);

    } catch (error) {

      // child is already stopped
      return done();

    }

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

function kill(hook, script, getChild) {

  global[hook]('kill ' + script, function (done) {

    var child = getChild();

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
