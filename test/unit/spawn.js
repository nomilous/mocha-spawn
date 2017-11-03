var expect = require('expect.js');
var child_process = require('child_process');

var spawn = require('../../lib/spawn');

describe('unit - spawn', function () {

  var originalBefore = global.before;

  afterEach(function () {

    global.before = originalBefore;

  });

  var originalAfter = global.after;

  afterEach(function () {

    global.after = originalAfter;

  });

  var originalFork = child_process.fork;

  afterEach(function () {

    child_process.fork = originalFork;

  });

  context('start()', function () {

    it('errors if child process exits prematurely', function (done) {

      global.before = function (title, fn) {

        var doneFn = function (error) {

          expect(error.message).to.be('Child exited immediately with code undefined, perhaps missing onStart()');
          done();

        };

        fn(doneFn);

      };

      child_process.fork = function (script) {

        return {

          once: function (event, handler) {

            if (event == 'exit') {

              return handler();

            }

          },

          on: function () {
          },

          send: function () {
          }

        }

      };

      spawn.before.start({script: '/script'});

    });

    context('childRef', function () {

      context('send()', function () {

        it('does not send if child does not exist', function () {

          var childRef = spawn.before.start({script: '/script'});

          childRef.send();

        });

        it('does not send if child process has exited', function () {

          global.before = function (title, fn) {

            var doneFn = function (error) {
            };

            fn(doneFn);

          };

          child_process.fork = function (script) {

            return {

              once: function () {
              },

              on: function () {
              },

              send: function () {
              }

            }

          };

          var childRef = spawn.before.start({script: '/script'});

          childRef.send();

        });

      });

      context('after.stop()', function () {

        it('returns with done if no child', function (done) {

          global.after = function (title, fn) {

            fn(done);

          };

          var childRef = spawn.before.start({script: '/script'});

          childRef.after.stop();

        });

        it('returns done if no child', function (done) {

          global.before = function (title, fn) {

            var doneFn = function (error) {
            };

            fn(doneFn);

          };

          child_process.fork = function (script) {

            return {

              once: function () {
              },

              on: function () {
              },

              send: function () {
              }

            }

          };

          global.after = function (title, fn) {

            fn(done);

          };

          var childRef = spawn.before.start({script: '/script'});

          childRef.after.stop();

        });

      });

      context('after.kill()', function () {

        it('returns with done if no child', function (done) {

          global.after = function (title, fn) {

            fn(done);

          };

          var childRef = spawn.before.start({script: '/script'});

          childRef.after.kill();

        });

      });

    });

  });

});
