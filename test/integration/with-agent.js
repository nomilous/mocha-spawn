var mochaSpawn = require('../..');
var path = require('path');

describe('with remote', function () {

  var securityToken = 'xxx';
  var agentServerScript = path.resolve(__dirname, '..', 'procs', 'agent-server-script');
  var agentServer = mochaSpawn.before.start(agentServerScript, {
    securityToken: securityToken
  });

  mochaSpawn.before.connect({
    agents: [{
      securityToken: securityToken,
      host: 'localhost',
      // port: 59595,
      rejectUnauthorized: false
    }]
  });

  var remoteScript = path.resolve(__dirname, '..', 'procs', 'remote-process');

  var childRef1 = mochaSpawn.before.startRemote(remoteScript, {START_OPTS: 1});
  var childRef2 = mochaSpawn.beforeEach.startRemote(remoteScript, {START_OPTS: 2});

  childRef1.after.stop({STOP_OPTS: 1});
  childRef2.afterEach.stop({STOP_OPTS: 2});

  mochaSpawn.after.disconnect();

  agentServer.after.stop();

  // just in case
  agentServer.on('error', function (err) {
    console.error('AGENT SERVER ERROR', err);
  });

  it('started remote processes', function (done) {

    this.timeout(6000);

    setTimeout(done, 500);

  });

  it('started a new instance where beforeEach', function (done) {

    this.timeout(6000);

    setTimeout(done, 500);

  });

});
