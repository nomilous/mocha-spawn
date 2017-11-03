var mochaSpawn = require('../..');
var interval;

mochaSpawn.onStart(function (opts, done) {

  interval = setInterval(function () {}, 100);
  done();

});

mochaSpawn.onStop(function (opts, done) {

  clearInterval(interval);
  done();

});
