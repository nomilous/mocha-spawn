var mochaSpawn = require('../..');
var RemoteAgent = mochaSpawn.RemoteAgent;

var agent = new RemoteAgent();

mochaSpawn.onStart(function (opts, done) {

  agent.on('error', function (err) {
    mochaSpawn.send('error', err.stack);
  });

  return agent.start();
});

mochaSpawn.onStop(function (opts, done) {
  done();
});
