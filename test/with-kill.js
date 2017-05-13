var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with kill', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-message');
  var scriptOpts = {};

  var originalAfter = global.after;

  afterEach(function () {

    global.after = originalAfter;

  });

  var emitter = MochaFork.start(scriptFile, scriptOpts);

  it('can send message and kill', function (done) {

    var exited = false;

    global.after = function (title, fn) {

      var doneFn = function (error) {

        expect(exited).to.be(true);
        done();

      };

      fn(doneFn);

    };

    emitter.once('message', function (data) {

      expect(data).to.eql({some: 'data'});
      MochaFork.kill(scriptFile);

    });

    emitter.once('exit', function (code, signal) {

      expect(code).to.be(null);
      expect(signal).to.be('SIGTERM');
      exited = true;

    });

  });

});

