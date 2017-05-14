var MochaFork = require('..');
var path = require('path');
var fetchUrl = require('fetch').fetchUrl;
var expect = require('expect.js');

describe('with each', function () {

  var pids = [];
  var scriptFile = path.resolve(__dirname, 'procs', 'http-server-with-stop');
  var scriptOpts = {
    port: 8080,
    host: 'localhost'
  };

  var childRef = MochaFork.beforeEach.start(scriptFile, scriptOpts);

  childRef.afterEach.stop();

  childRef.on('started', function (data) {

    var pid = data.pid;

    if (pids.indexOf(pid) >= 0) return;

    pids.push(pid);

  });

  it('started server first time', function (done) {

    fetchUrl('http://localhost:8080', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.be(childRef._child.pid + ' OK');
      done();

    });

  });

  it('started server second time', function (done) {

    fetchUrl('http://localhost:8080', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.be(childRef._child.pid + ' OK');
      done();

    });

  });

  it('started server third time', function (done) {

    fetchUrl('http://localhost:8080', function (e, meta, body) {

      if (e) return done(e);

      expect(body.toString()).to.be(childRef._child.pid + ' OK');
      done();

    });

  });

  it('started multiple childs', function () {

    expect(pids.length).to.be(4);

  });

});
