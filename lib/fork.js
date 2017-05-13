var child_process = require('child_process');
var children = {};

module.exports.start = function (script, opts) {

  before('start ' + script, function (done) {

    var child = children[script] = child_process.fork(script);

    var onExit = function (code) {

      done(new Error('Exited unexpectedly with code ' + code));

    };

    child.once('exit', onExit);

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

      }

    });

    child.send({
      action: 'start',
      opts: opts
    });

  });

};

module.exports.stop = function (script) {

  after('stop ' + script, function (done) {

    var child = children[script];

    if (!child) return done();

    child.on('exit', function () {

      done();

    });

    child.on('message', function (message) {

      var error;

      switch (message.action) {

        case 'stopError':
          error = new Error();error.name = message.name;
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
