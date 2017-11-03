var mochaSpawn = require('../..');
var path = require('path');
var expect = require('expect.js');

describe('with child', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'server-with-non-errors');

  var childRef = mochaSpawn.before.start({
    script: scriptFile
  });

  childRef.after.stop();

  it('has access to child', function () {

    expect(typeof childRef._child).to.be('object');

    expect(typeof childRef._child.pid).to.be('number');

  });

});
