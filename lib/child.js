var gotStop = false;

module.exports.start = function (fn, emitter) {

  var promised = false;
  var doneCount = 0;

  var done = function (error) {

    doneCount++;

    if (promised && doneCount > 1) return;

    if (error && error instanceof Error) {

      process.send({
        action: 'startError',
        name: error.name,
        message: error.message
      });

      return;

    }

    process.send({
      action: 'started'
    });

  };

  process.on('message', function (message) {

    var result;

    switch (message.action) {

      case 'start':

        result = fn(message.opts, done);

        if (result && typeof result.then == 'function' && typeof result.catch == 'function') {

          promised = true;

          result.then(done).catch(done);

        }

        return;

      case 'message':

        emitter.emit(message.event, message.data);

        return;

      case 'stop':

        if (gotStop) return;

        process.send({
          action: 'stopError',
          name: 'Error',
          message: 'Child missing onStop()'
        });

        return;

    }

  });

};


module.exports.stop = function (fn) {

  var promised = false;
  var doneCount = 0;

  var done = function (error) {

    doneCount++;

    if (promised && doneCount > 1) return;

    if (error && error instanceof Error) {

      process.send({
        action: 'stopError',
        name: error.name,
        message: error.message
      });

      return;

    }

    process.removeAllListeners('message');

  };

  gotStop = true;

  process.on('message', function (message) {

    var result;

    if (message.action == 'stop') {

      result = fn(message.opts, done);

      if (result && typeof result.then == 'function' && typeof result.catch == 'function') {

        promised = true;

        result.then(done).catch(done);

      }

    }

  });

};
