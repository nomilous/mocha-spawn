var mochaSpawn = require('../..');
var path = require('path');

describe('with remote', function () {

  // var agentRun = {
  //   script: path.resolve(__dirname, '..', 'procs', 'agent-server-script'),
  // }
  //
  // // normally this is done using bin/mocha-spawn-agent on remote host
  // var agentServer = mochaSpawn.before.start(agentRun, {
  //   securityToken: 'XXX',
  //   path: path.resolve(__dirname, '..', '..')
  // });

  mochaSpawn.before.connect({
    agents: [{
      securityToken: 'XXX',
      host: 'localhost',
      // port: 59595,
      rejectUnauthorized: false
    }]
  });

  var remoteScriptRun = {
    script: 'test/procs/remote-process',
    timeout: 500
  };

  var childRef1 = mochaSpawn.before.startRemote(remoteScriptRun, {
    START_OPTS: 1
  });
  // var childRef2 = mochaSpawn.beforeEach.startRemote(remoteScriptRun, {
  //   START_OPTS: 2
  // });

  childRef1.after.stop({
    timeout: 500
  }, {
    STOP_OPTS: 1
  });
  // childRef2.afterEach.stop(null, {
  //   STOP_OPTS: 2
  // });

  mochaSpawn.after.disconnect();

  // agentServer.after.stop();
  //
  // // just in case
  // agentServer.on('error', function (err) {
  //   console.error('AGENT SERVER ERROR', err);
  // });

  it('started remote processes', function (done) {

    this.timeout(10000);

    setTimeout(done, 500);

  });

  xit('started a new instance where beforeEach', function (done) {

    this.timeout(6000);

    setTimeout(done, 500);

  });


});
