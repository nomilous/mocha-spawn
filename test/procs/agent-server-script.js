var mochaSpawn = require('../..');
var AgentServer = mochaSpawn.AgentServer;

var agentServer;

mochaSpawn.onStart(function (opts, done) {
  agentServer = new AgentServer(opts);
  agentServer.on('error', function (err) {
    mochaSpawn.send('error', err.stack);
  });

  return agentServer.start();
});

mochaSpawn.onStop(function (opts, done) {
  return agentServer.stop()
});
