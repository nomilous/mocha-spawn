var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with child', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-non-errors');

  var hookRef = MochaFork.before.start(scriptFile);

  hookRef.after.stop();

  it('has access to child', function () {

    expect(typeof hookRef._child).to.be('object');

    expect(typeof hookRef._child.pid).to.be('number');

  });

});
