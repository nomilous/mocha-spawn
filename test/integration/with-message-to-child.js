var mochaSpawn = require('../..');
var path = require('path');
var expect = require('expect.js');

describe('with message to child', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'server-receive-message-from-parent');

  var childRef = mochaSpawn.before.start({
    script: scriptFile
  });

  it('can send message to child', function (done) {

    childRef.send('event-name', {
      kill: true
    });

    childRef.on('exit', function () {

      done();

    });

  });

});
