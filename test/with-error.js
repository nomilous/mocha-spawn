var MochaFork = require('..');
var path = require('path');
var expect = require('expect.js');

describe('with error', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'server-with-errors');

  var originalBefore = global.before;
  var originalAfter = global.after;

  afterEach(function () {

    global.before = originalBefore;
    global.after = originalAfter;

  });

  // MochaFork.start(scriptFile);
  //
  // MochaFork.stop(scriptFile);

  it('can error on start', function (done) {

    global.before = function (title, fn) {

      var doneFn = function (error) {

        expect(error.name).to.be('Error');
        expect(error.message).to.be('Failed to start');
        done();

      };

      fn(doneFn);

    };

    MochaFork.start(scriptFile);

  });

});
