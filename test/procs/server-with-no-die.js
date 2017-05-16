var MochaFork = require('../..');

MochaFork.onStart(function (opts, done) {

  setInterval(function () {}, 1000);
  done();

});

MochaFork.onStop(function (opts, done) {

  done();

});


