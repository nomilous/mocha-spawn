var MochaFork = require('../..');

MochaFork.start(function (done) {

  done(new Error('Failed to start'));

});

MochaFork.stop(function (done) {

  done(new Error('Failed to stop'));

});
