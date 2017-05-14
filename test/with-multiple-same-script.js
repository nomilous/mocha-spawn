var MochaFork = require('..');
var path = require('path');
var fetchUrl = require('fetch').fetchUrl;
var expect = require('expect.js');

describe('with multiple same script', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'http-server-with-stop');

  var hookRef1 = MochaFork.before.start(scriptFile, {
    port: 8080,
    host: 'localhost'
  });

  var hookRef2 = MochaFork.before.start(scriptFile, {
    port: 8081,
    host: 'localhost'
  });

  var hookRef3 = MochaFork.before.start(scriptFile, {
    port: 8082,
    host: 'localhost'
  });

  hookRef1.after.stop();

  hookRef2.after.stop();

  hookRef3.after.stop();

  it('started server 1', function (done) {

    fetchUrl('http://localhost:8080', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.match(/OK/);
      done();

    });

  });

  it('started server 2', function (done) {

    fetchUrl('http://localhost:8081', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.match(/OK/);
      done();

    });

  });

  it('started server 3', function (done) {

    fetchUrl('http://localhost:8082', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.match(/OK/);
      done();

    });

  });

});
