var mochaSpawn = require('../..');
var path = require('path');
var fetchUrl = require('fetch').fetchUrl;
var expect = require('expect.js');

describe('with stop', function () {

  var scriptFile = path.resolve(__dirname, '..', 'procs', 'http-server-with-stop');
  var scriptOpts = {
    port: 8080,
    host: 'localhost',
    timeout: 1000
  };

  var childRef = mochaSpawn.before.start(scriptFile, scriptOpts);

  childRef.after.stop({
    timeout: 1000
  });

  it('started server', function (done) {

    fetchUrl('http://localhost:8080', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.match(/OK/);
      done();

    });

  });

});
