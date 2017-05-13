module.exports.start = function (fn) {

  var done = function (error) {

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

    if (message.action == 'start') {

      fn(done, message.opts);

    }

  });

};


module.exports.stop = function (fn) {

  var done = function (error) {

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

  process.on('message', function (message) {

    if (message.action == 'stop') {

      fn(done);

    }

  });

};
