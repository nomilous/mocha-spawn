var MochaFork = require('../..');

MochaFork.onStart(function (done) {

  done('not error if not error');

});

MochaFork.onStop(function (done) {

  done('not error if not error');

});
