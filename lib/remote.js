var EventEmitter = require('events').EventEmitter;
var util = require('util');
var shortid = require('shortid');

var AgentClient = require('./agent-client');
var agents = [];


module.exports.connect = function connect(opts) {

  before('connect to agents', function (done) {

    if (opts && typeof opts.hookTimeout == 'number') {

      this.timeout(opts.hookTimeout);

    } else {

      // 1 second longer than socket.io default connect timeout
      // (more though into this perhaps, waiting sucks)
      this.timeout(21000);

    }

    if (!opts.agents) done(new Error('missing agents to connect to'));

    opts.agents.forEach(function (agentOpts) {

      agents.push(new AgentClient(agentOpts));

    });

    Promise.all(agents.map(function (agent) {
        return agent.start();
      }))

      .then(function () {
        done();
      })

      // Some agents may have started despite the error
      // they will be stopped in the 'disconnect agents' hook
      .catch(done);

  });

}

module.exports.disconnect = function disconnect(opts) {

  after('disconnect from agents', function (done) {

    if (opts && typeof opts.hookTimeout == 'number') {

      this.timeout(opts.hookTimeout);

    }

    Promise.all(agents.map(function (agent) {
        return agent.stop();
      }))

      .then(function () {
        done();
      })

      .catch(function (err) {
        console.error('===========================================');
        console.error('One or more agents clients failed to stop!!');
        console.error()
        console.error('There may be processes left running at the');
        console.error('agent servers. Recommending manual cleanup.');
        console.error('===========================================');
        done(err);
      });

  });

}


module.exports.start = function startRemote(hook, run, opts) {

  var childRef = new EventEmitter();
  var afterHook;

  global[hook]('start remote ' + run.script, function (done) {

    var timedout = false;
    var timeout;
    var agent;
    var id;

    if (typeof run.script == 'undefined') {

      return done(new Error('Missing run.script'));

    }

    function onTimeout() {

      var fireAndForget = true;

      timedout = true;

      agent.killProcess(id, fireAndForget)

        .catch(function (err) {

          // ignore

        });

      done(new Error(util.format(
        'Timeout of %sms exceeded.',
        typeof run.timeout == 'number' ? run.timeout : 2000
      )));

    }

    this.timeout(0);

    if (typeof run.timeout == 'number') {

      timeout = setTimeout(onTimeout, run.timeout);

    } else {

      timeout = setTimeout(onTimeout, 2000);

    }

    agent = agents

      .filter(function (agent) {
        return agent.isMember(run.group || 'any');
      })

      .sort(function (agentA, agentB) {
        console.log('A', agentA);
        console.log('B', agentB);
      })

      .shift();

    id = shortid.generate();

    agent.spawnProcess(id, run, opts)

      .then(function () {

        if (timedout) return;

        clearTimeout(timeout);

        done();

      })

      .catch(function (err) {

        if (timedout) return;

        clearTimeout(timeout);

        done(err);

      });

  });


  afterHook = hook == 'before' ? 'after' : 'afterEach';

  childRef[afterHook] = {

    stop: function (stopRun, opts) {

      return stop(afterHook, stopRun, run, opts);

    },

    kill: function (stopRun, opts) {

      return kill(afterHook, stopRun, run, opts);

    }

  }

  return childRef;

}


function stop(hook, stopRun, run, opts) {

  global[hook]('stop remote ' + run.script, function (done) {

    if (stopRun && typeof stopRun.timeout == 'number') {

      this.timeout(stopRun.timeout);

    }

    console.log('TODO: STOP', opts);
    done();

  });

}

function kill(hook, stopRun, run, opts) {

  global[hook]('kill remote ' + run.script, function (done) {

    if (stopRun && typeof stopRun.timeout == 'number') {

      this.timeout(stopRun.timeout);

    }


    console.log('TODO: KILL', opts);
    done();

  });

}
