var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with message and kill', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-send-message-to-parent');
  var scriptOpts = {};

  var originalAfter = global.after;

  afterEach(function () {

    global.after = originalAfter;

  });

  var child = MochaFork.before.start(scriptFile, scriptOpts);

  it('can send message from child and kill', function (done) {

    var exited = false;

    global.after = function (title, fn) {

      var doneFn = function (error) {

        expect(exited).to.be(true);
        done();

      };

      fn(doneFn);

    };

    child.once('event-name', function (data) {

      expect(data).to.eql({some: 'data from child'});
      MochaFork.after.kill(scriptFile);

    });

    child.once('exit', function (code, signal) {

      expect(code).to.be(null);
      expect(signal).to.be('SIGTERM');
      exited = true;

    });

  });

});

