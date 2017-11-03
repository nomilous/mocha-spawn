var mochaSpawn = require('../..');
var path = require('path');
var expect = require('expect.js');

describe('with remote', function () {

  var agentServer

  before('start agent server', function () {
    agentServer = new mochaSpawn.AgentServer({
      path: path.resolve(__dirname, '..', '..'),
      securityToken: 'XXX'
    });
    agentServer.on('error', function (err) {
      console.error('AGENT SERVER ERROR', err);
    });
    return agentServer.start();
  });

  mochaSpawn.before.connect({
    agents: [{
      securityToken: 'XXX',
      host: 'localhost',
      // port: 59595,
      rejectUnauthorized: false
    }]
  });

  mochaSpawn.after.disconnect();

  after('stop agent server', function () {
    if (!agentServer) return;
    return agentServer.stop();
  });

  context('start', function () {

    var testContext;

    beforeEach(function () {
      this.before = global.before;
      this.after = global.after;

      testContext = {
        timeout: function () {}
      }
    });

    afterEach(function () {
      global.before = this.before;
      global.after = this.after;
    });

    it('stops remote precesses on timeout', function (done) {

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e.name).to.be('Error');
            expect(e.message).to.be('Timeout of 500ms exceeded.');

            // the child whose "start" timed out is not left
            // laying around, it gets killed
            var pid = agentServer.sockets[0].procs[0]._child.pid;

            try {
              // ensure child was started
              process.kill(pid, 0);
            } catch (e) {
              throw new Error('missing child');
            }

            setTimeout(function () {

              // ensure that client and server no longer have
              // reference to process
              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              // ensure process is gone

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not killed');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-start-timeout',
        timeout: 500
      }

      mochaSpawn.before.startRemote(run);

    });

    it('stops remote precesses on error', function (done) {

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e.name).to.be('Error');
            expect(e.message).to.be('Some start error.');

            // the child whose "start" timed out is not left
            // laying around, it gets killed
            var pid = agentServer.sockets[0].procs[0]._child.pid;

            try {
              // ensure child was started
              process.kill(pid, 0);
            } catch (e) {
              throw new Error('missing child');
            }

            setTimeout(function () {

              // ensure that client and server no longer have
              // reference to process
              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              // ensure process is gone

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not killed');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-start-error',
        timeout: 500
      }

      mochaSpawn.before.startRemote(run);

    });

    it('handles start ok', function (done) {

      var pid;

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            pid = agentServer.sockets[0].procs[0]._child.pid;

          } catch (e) {

            return done(e);

          }

          childRef.after.stop();

        });

      }

      global.after = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          setTimeout(function () {

            expect(agentServer.sockets[0].procs).to.eql([]);
            expect(mochaSpawn.agents[0].procs).to.eql([]);

            try {
              process.kill(pid, 0);
            } catch (e) {
              return done();
            }

            throw new Error('child not stopped');

          }, 500);

        });

      }

      var run = {
        script: 'test/procs/remote-start-ok',
        timeout: 500
      }

      var childRef = mochaSpawn.before.startRemote(run);

    });

  });

  context('stop', function () {

    var testContext;

    beforeEach(function () {
      this.before = global.before;
      this.after = global.after;

      testContext = {
        timeout: function () {}
      }
    });

    afterEach(function () {
      global.before = this.before;
      global.after = this.after;
    });

    it('stops remote precesses on stop timeout', function (done) {

      var pid;

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            pid = agentServer.sockets[0].procs[0]._child.pid;

          } catch (e) {

            return done(e);

          }

          childRef.after.stop({
            timeout: 500
          });

        });

      }

      global.after = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e.name).to.equal('Error');
            expect(e.message).to.equal('Timeout of 500ms exceeded.');

            setTimeout(function () {

              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not stopped');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-stop-timeout',
        timeout: 500
      }

      var childRef = mochaSpawn.before.startRemote(run);

    });

    it('stops remote precesses on stop error', function (done) {

      var pid;

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            pid = agentServer.sockets[0].procs[0]._child.pid;

          } catch (e) {

            return done(e);

          }

          childRef.after.stop({
            timeout: 500
          });

        });

      }

      global.after = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e.name).to.equal('Error');
            expect(e.message).to.equal('ooops');

            setTimeout(function () {

              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not stopped');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-stop-error',
        timeout: 500
      }

      var childRef = mochaSpawn.before.startRemote(run);

    });

    it('handles stop ok', function (done) {

      var pid;

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            pid = agentServer.sockets[0].procs[0]._child.pid;

          } catch (e) {

            return done(e);

          }

          childRef.after.stop({
            timeout: 500
          });

        });

      }

      global.after = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            setTimeout(function () {

              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not stopped');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-stop-ok',
        timeout: 500
      }

      var childRef = mochaSpawn.before.startRemote(run);

    });

  });

  context('kill', function () {

    var testContext;

    beforeEach(function () {
      this.before = global.before;
      this.after = global.after;

      testContext = {
        timeout: function () {}
      }
    });

    afterEach(function () {
      global.before = this.before;
      global.after = this.after;
    });

    it('stops remote precesses on kill timeout', function (done) {

      var pid;

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            pid = agentServer.sockets[0].procs[0]._child.pid;

          } catch (e) {

            return done(e);

          }

          childRef.after.kill({
            timeout: 0
          });

        });

      }

      global.after = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e.name).to.equal('Error');
            expect(e.message).to.equal('Timeout of 500ms exceeded.');

            setTimeout(function () {

              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not stopped');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-kill-timeout',
        timeout: 500
      }

      var childRef = mochaSpawn.before.startRemote(run);

    });

    it('handles kill ok', function (done) {

      var pid;

      global.before = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            pid = agentServer.sockets[0].procs[0]._child.pid;

          } catch (e) {

            return done(e);

          }

          childRef.after.kill({
            timeout: 500
          });

        });

      }

      global.after = function (str, hookFn) {

        hookFn.call(testContext, function (e) {

          try {

            expect(e).to.equal(undefined);

            setTimeout(function () {

              expect(agentServer.sockets[0].procs).to.eql([]);
              expect(mochaSpawn.agents[0].procs).to.eql([]);

              try {
                process.kill(pid, 0);
              } catch (e) {
                return done();
              }

              throw new Error('child not stopped');

            }, 500);

          } catch (e) {

            done(e);

          }

        });

      }

      var run = {
        script: 'test/procs/remote-kill-ok',
        timeout: 500
      }

      var childRef = mochaSpawn.before.startRemote(run);

    });

  });

  context('messages', function () {

    it('can send and receive message');

  });

  context('beforeEach', function () {

    it('has different pid...');

    it('...when beforeEach');

  });

  context('multiples', function () {

    it('todo');

  });

  context('groups', function () {

    it('todo');

  });

});
