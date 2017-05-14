var expect = require('expect.js');
var semver = require('semver');

var child = require('../../lib/child');

describe('unit - child', function () {

  var originalOn = process.on;

  afterEach(function () {

    process.on = originalOn;

  });

  var originalSend = process.send;

  afterEach(function () {

    process.send = originalSend;

  });

  var originalRemoveAllListeners = process.removeAllListeners;

  afterEach(function () {

    process.removeAllListeners = originalRemoveAllListeners;

  });

  context('start()', function () {

    it('calls the start function on message start and handles error', function (done) {

      process.on = function (event, handler) {

        if (event == 'message') {

          handler({
            action: 'start'
          })

        }

      };

      process.send = function (message) {

        expect(message.action).to.be('startError');
        expect(message.name).to.be('Error');
        expect(message.message).to.be('error starting');
        done();

      };

      var startFn = function(opts, doneFn) {

        doneFn(new Error('error starting'));

      };

      child.start(startFn);

    });

    if (semver.satisfies(process.version, '>=6.0.0')) {

      it('handles promise in start function', function (done) {

        process.on = function (event, handler) {

          if (event == 'message') {

            handler({
              action: 'start'
            });

            // avoid duplicate done on promise

            handler({
              action: 'start'
            });

          }

        };

        process.send = function (message) {

          expect(message.action).to.be('started');
          done();

        };

        var startFn = function() {

          return new Promise(function (resolve) {

            resolve();

          });

        };

        child.start(startFn);

      });

    }

    it('handles events from parent', function (done) {

      process.on = function (event, handler) {

        if (event == 'message') {

          handler({
            action: 'message',
            args: ['event-name','event-data']
          });

        }

      };

      var startFn = function(opts, doneFn) {

        doneFn('not error');

      };

      var emitter = {

        emit: function (event, data) {

          expect(event).to.be('event-name');
          expect(data).to.be('event-data');
          done();

        }

      };

      child.start(startFn, emitter);

    });

    it('errors if stop is not defined', function (done) {

      process.on = function (event, handler) {

        if (event == 'message') {

          handler({
            action: 'stop'
          });

        }

      };

      process.send = function (message) {

        expect(message.action).to.be('stopError');
        expect(message.name).to.be('Error');
        expect(message.message).to.be('Child missing onStop()');
        done();

      };

      child.start();

    });

  });

  context('stop()', function () {

    it('calls the stop function on message stop and handles error', function (done) {

      process.on = function (event, handler) {

        if (event == 'message') {

          handler({
            action: 'stop'
          })

        }

      };

      process.send = function (message) {

        expect(message.action).to.be('stopError');
        expect(message.name).to.be('Error');
        expect(message.message).to.be('error stopping');
        done();

      };

      var stopFn = function(opts, doneFn) {

        doneFn(new Error('error stopping'));

      };

      child.stop(stopFn);

    });

    if (semver.satisfies(process.version, '>=6.0.0')) {

      it('handles promise in stop function', function (done) {

        process.on = function (event, handler) {

          if (event == 'message') {

            handler({
              action: 'stop'
            });

            // avoid duplicate done on promise

            handler({
              action: 'stop'
            });

          }

        };

        process.removeAllListeners = function () {

          done();

        };

        var stopFn = function() {

          return new Promise(function (resolve) {

            resolve();

          });

        };

        child.stop(stopFn);

      });

    }

    it('start does not error on stop if stopFn is defined', function (done) {

      process.on = function (event, handler) {

        if (event == 'message') {

          handler({
            action: 'stop'
          });

          handler({
            action: 'other'
          });

        }

      };

      var stopFn = function(doneFn) {

        done();

      };

      child.stop(stopFn);

      child.start(function () {});

    });

  });

});
