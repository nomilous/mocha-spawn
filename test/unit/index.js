var expect = require('expect.js');

var index = require('../../lib/index');
var child = require('../../lib/child');

describe('unit - index', function () {

  context('onStart()', function () {

    var originaStart = child.start;

    afterEach(function () {

      child.start = originaStart;

    });

    it('calls child.start()', function (done) {

      function handler() {
      }

      child.start = function (fn, emitter) {

        expect(fn).to.equal(handler);
        // expect(emitter).to.equal(child);
        done();

      };

      index.onStart(handler);

    });

  });

  context('send()', function () {

    var originalSend = process.send;

    afterEach(function () {

      process.send = originalSend;

    });

    it('does not allow exit event', function (done) {

      try {

        index.send('exit');

      } catch (error) {

        expect(error.message).to.equal('cannot send exit event');
        return done();

      }

      done(new Error('did not reject exit message'));

    });

    it('calls process.send()', function (done) {

      process.send = function (message) {

        try {

          expect(message).to.eql({
            action: 'message',
            args: [
              'some-event'
            ]
          });

        } catch (error) {

          return done(error);

        }

        done();

      };

      index.send('some-event');

    });

  });

});
