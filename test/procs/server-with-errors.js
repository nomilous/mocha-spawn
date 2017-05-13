var MochaFork = require('../..');

MochaFork.onStart(function (opts, done) {

  done(new Error('Failed to start'));

});

MochaFork.onStop(function (done) {

  done(new Error('Failed to stop'));

});
