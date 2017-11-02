var EventEmitter = require('events').EventEmitter;
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

    if (typeof run.script == 'undefined') {

      return done(new Error('Missing run.script'));

    }

    if (typeof run.timeout == 'number') {

      this.timeout(run.timeout);

    }

    var agent = agents

      .filter(function (agent) {
        return agent.isMember(run.group || 'any');
      })

      .sort(function (agentA, agentB) {
        console.log('A', agentA);
        console.log('B', agentB);
      })

      .shift();

    agent.spawnProcess(run, opts)

      .then(function () {

        done();

      })

      .catch(done);

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
