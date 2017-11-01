var mochaSpawn = require('../..');
var RemoteAgent = mochaSpawn.RemoteAgent;

mochaSpawn.onStart(function (opts, done) {
  done();
});

mochaSpawn.onStop(function (opts, done) {
  done();
});
