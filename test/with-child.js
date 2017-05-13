var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with child', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-non-errors');

  var child = MochaFork.before.start(scriptFile);

  MochaFork.after.stop(scriptFile);

  it('has access to child', function () {

    expect(typeof child._child).to.be('object');

    expect(typeof child._child.pid).to.be('number');

  });

});
