var MochaFork = require('../..');

MochaFork.onStart(function (done) {

  done();

});

MochaFork.on('event-name', function (data) {

  if (data.kill) process.exit(1);

});
