var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with message to child', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-receive-message-from-parent');

  var hookRef = MochaFork.before.start(scriptFile);

  it ('can send message to child', function (done) {

    hookRef.send('event-name', {kill: true});

    hookRef.on('exit', function () {

      done();

    });

  });

});
