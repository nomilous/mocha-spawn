var MochaFork = require('../..');

MochaFork.onStart(function (opts, done) {

  done();

});

MochaFork.on('event-name', function (data) {

  if (data.kill) process.exit(1);

});
