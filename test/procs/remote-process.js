var mochaSpawn = require('../..');
var interval;

mochaSpawn.onStart(function (opts, done) {

  console.log('REMOTE PROCESS START', opts);
  interval = setInterval(function () {}, 100);
  done(new Error('oh noh'));

});

mochaSpawn.onStop(function (opts, done) {

  console.log('REMOTE PROCESS STOP', opts);
  clearInterval(interval);
  // done();

});
