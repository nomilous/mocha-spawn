var MochaFork = require('../..');

MochaFork.on('request-from-server', function (arg1, arg2) {

  MochaFork.send('reply-from-client', arg1, arg2);

});

MochaFork.onStart(function (opts, done) {

  done();

});

MochaFork.onStop(function (opts, done) {

  done();

});
