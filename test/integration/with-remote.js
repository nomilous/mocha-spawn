var mochaSpawn = require('../..');
var path = require('path');

describe('with remote', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'remote-agent-script');
  var scriptOpts = {};

  var remoteAgent = mochaSpawn.before.start(scriptFile, scriptOpts);

  remoteAgent.after.stop();

  // just in case
  remoteAgent.on('error', function (err) {
    console.error('ERROR', err);
  });

  it('xxxx', function (done) {

    this.timeout(30000);
    

  });

});
