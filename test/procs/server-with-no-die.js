var MochaSpawn = require('../..');

MochaSpawn.onStart(function (opts, done) {

  setInterval(function () {}, 1000);
  done();

});

MochaSpawn.onStop(function (opts, done) {

  done();

});
