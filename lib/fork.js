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

  var childRef = new EventEmitter();
  var child;
  var getChild;
  var afterHook;

  global[hook]('start ' + script, function (done) {

    if (opts && typeof opts.timeout == 'number') {

      this.timeout(opts.timeout);

    }

    var onExit = function (code) {

      done(new Error('Child exited unexpectedly with code ' + code + ', perhaps missing onStart()'));

    };

    child = childRef._child = child_process.fork(script);

    child.once('exit', onExit);

    child.on('exit', function (code, signal) {

      childRef.emit('exit', code, signal);

      delete childRef._child;

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

          childRef.emit.apply(childRef, message.args);
          return;

      }

    });

    child.send({
      action: 'start',
      opts: opts
    });

  });

  childRef.send = function (event) {

    var args;

    if (!child) return;

    try {

      process.kill(child.pid, 0);

    } catch (error) {

      return;

    }

    args = Array.prototype.slice.apply(arguments);

    child.send({
      action: 'message',
      args: args
    });

  };

  getChild = function () {

    return child;

  };

  afterHook = hook == 'before' ? 'after' : 'afterEach';

  childRef[afterHook] = {

    stop: function (opts) {

      return stop(afterHook, script, getChild, opts);

    },

    kill: function (opts) {

      return kill(afterHook, script, getChild, opts);

    }

  };

  return childRef;

}


function stop(hook, script, getChild, opts) {

  global[hook]('stop ' + script, function (done) {

    if (opts && typeof opts.timeout == 'number') {

      this.timeout(opts.timeout);

    }

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
      action: 'stop',
      opts: opts
    });

  });

}

function kill(hook, script, getChild, opts) {

  global[hook]('kill ' + script, function (done) {

    if (opts && typeof opts.timeout == 'number') {

      this.timeout(opts.timeout);

    }

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
