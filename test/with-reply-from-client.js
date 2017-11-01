var MochaSpawn = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with reply from client', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-reply');

  var childRef = MochaSpawn.before.start(scriptFile);

  childRef.after.stop();

  it('started and stopped', function (done) {

    childRef.on('reply-from-client', function (arg1, arg2) {

      expect(arg1).to.be('arg1');
      expect(arg2).to.be('arg2');
      done();

    });

    childRef.send('request-from-server', 'arg1', 'arg2');

  });

});
