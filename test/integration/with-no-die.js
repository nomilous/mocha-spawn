var mochaSpawn = require('../..');
var path = require('path');

describe('with no die', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'server-with-no-die');

  var childRef = mochaSpawn.before.start({
    script: scriptFile
  });

  // childRef.after.stop();

  it('started and stopped', function () {

    // manual check child exited on mocha exited

  });

});
