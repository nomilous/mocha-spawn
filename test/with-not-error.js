var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with not error', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-non-errors');

  var hookRef = MochaFork.before.start(scriptFile);

  hookRef.after.stop();

  it('started and stopped', function () {});

});
