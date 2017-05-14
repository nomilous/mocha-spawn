var MochaFork = require('..');
var path = require('path');
var fetchUrl = require('fetch').fetchUrl;
var expect = require('expect.js');
var semver = require('semver');

if (!semver.satisfies(process.version, '^7.10.0')) return;

describe('with async await', function () {

  var scriptFile = path.resolve(__dirname, 'procs', 'http-server-with-async');
  var scriptOpts = {
    port: 8080,
    host: 'localhost'
  };

  var childRef = MochaFork.before.start(scriptFile, scriptOpts);

  childRef.after.stop();

  it('started server', function (done) {

    fetchUrl('http://localhost:8080', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.be('ASYNC SERVER OK');
      done();

    });

  });

});
