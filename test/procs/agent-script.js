var mochaSpawn = require('../..');
var Agent = mochaSpawn.Agent;

var agent;

mochaSpawn.onStart(function (opts, done) {
  agent = new Agent(opts);
  agent.on('error', function (err) {
    mochaSpawn.send('error', err.stack);
  });

  return agent.start();
});

mochaSpawn.onStop(function (opts, done) {
  done();
});
