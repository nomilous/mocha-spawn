var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;
var children = {};

module.exports.before = {

  start: function (run, opts) {

    return start('before', run, opts);

  }

};

module.exports.beforeEach = {

  start: function (run, opts) {

    return start('beforeEach', run, opts);

  }

};

process.on('exit', function () {

  Object.keys(children).forEach(function (pid) {

    var child = children[pid];

    delete children[pid];

    try {

      child.kill();

    } catch (error) {

      // sometimes child.kill is not a function?

    }

  });

});

function start(hook, run, opts) {

  var childRef = new EventEmitter();
  var child;
  var getChild;
  var afterHook;

  global[hook]('start ' + run.script, function (done) {

    if (typeof run.script == 'undefined') {

      return done(new Error('Missing run.script'));

    }

    if (typeof run.timeout == 'number') {

      this.timeout(run.timeout);

    }

    var onExit = function (code) {

      done(new Error('Child exited immediately with code ' + code + ', perhaps missing onStart()'));

    };

    var options = {};

    var debugParam = (function (array, contains) {
      return contains.some(function (el) {
        for (var param of array) {
          if (param.indexOf(el) >=0) {
            return el;
          }
        }
        return null;
      });
    })(process.execArgv, [
      '--inspect',
      '--inspect-brk',
      '--debug',
      '--debug-brk'
    ]);

    if (debugParam) {
      // child inherits debugmode from parent, but then port is in-use
      // and crashes, fix:
      // use random debug port for child
      var random = Math.floor(Math.random() * 64511) + 1024;
      options.execArgv = [debugParam + '=' + random];
    }

    child = childRef._child = child_process.fork(run.script, [], options);

    children[child.pid] = child;

    child.once('exit', onExit);

    child.on('exit', function (code, signal) {

      childRef.emit('exit', code, signal);

      delete children[child.pid];

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
          // error.stack = message.stack;
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

    stop: function (stopRun, opts) {

      return stop(afterHook, stopRun, run, getChild, opts);

    },

    kill: function (stopRun, opts) {

      return kill(afterHook, stopRun, run, getChild, opts);

    }

  };

  return childRef;

}

function stop(hook, stopRun, run, getChild, opts) {

  global[hook]('stop ' + run.script, function (done) {

    if (stopRun && typeof stopRun.timeout == 'number') {

      this.timeout(stopRun.timeout);

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

function kill(hook, stopRun, run, getChild, opts) {

  global[hook]('kill ' + run.script, function (done) {

    if (stopRun && typeof stopRun.timeout == 'number') {

      this.timeout(stopRun.timeout);

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
