var MochaSpawn = require('../..');
var path = require('path');
var expect = require('expect.js');

describe('with message and kill', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'server-send-message-to-parent');
  var scriptOpts = {};

  var originalAfter = global.after;

  afterEach(function () {

    global.after = originalAfter;

  });

  var childRef = MochaSpawn.before.start(scriptFile, scriptOpts);

  it('can send message from child and kill', function (done) {

    var exited = false;

    global.after = function (title, fn) {

      var doneFn = function (error) {

        expect(exited).to.be(true);
        done();

      };

      fn(doneFn);

    };

    childRef.once('event-name', function (data1, data2) {

      expect(data1).to.eql({some: 'data from child'});
      expect(data2).to.equal('more');
      childRef.after.kill();

    });

    childRef.once('exit', function (code, signal) {

      // expect(code).to.be(null);
      // expect(signal).to.be('SIGTERM');
      exited = true;

    });

  });

});
