var mochaSpawn = require('../..');
var path = require('path');

describe('with remote', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'remote-agent-script');
  var scriptOpts = {};

  var remoteAgent = mochaSpawn.before.start(scriptFile, scriptOpts);

  remoteAgent.after.stop();

  it('xxxx');

});
