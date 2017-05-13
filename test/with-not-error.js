var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with not error', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-non-errors');

  MochaFork.before.start(scriptFile);

  MochaFork.after.stop(scriptFile);

  it('started and stopped', function () {});

});
