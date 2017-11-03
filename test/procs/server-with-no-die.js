var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  setInterval(function () {}, 1000);
  done();

});

mochaSpawn.onStop(function (opts, done) {

  done();

});
