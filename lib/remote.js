var EventEmitter = require('events').EventEmitter;
var AgentClient = require('./agent-client');
var agents = [];


module.exports.connect = function connect(opts) {

  before('connect agents', function (done) {

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

  after('disconnect agents', function (done) {

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


module.exports.start = function startRemote(hook, script, opts) {

  var childRef = new EventEmitter();
  var afterHook;

  global[hook]('start remote ' + script, function (done) {

    if (opts && typeof opts.hookTimeout == 'number') {

      this.timeout(opts.hookTimeout);

    }

    var spread = agents.filter(function (agent) {
      return
    });

    console.log('TODO: START SCRIPT', opts);
    done();

  });


  afterHook = hook == 'before' ? 'after' : 'afterEach';

  childRef[afterHook] = {

    stop: function (opts) {

      return stop(afterHook, script, opts);

    },

    kill: function (opts) {

      return kill(afterHook, script, opts);

    }

  }

  return childRef;

}


function stop(hook, script, opts) {

  global[hook]('stop remote ' + script, function (done) {

    console.log('TODO: STOP', opts);
    done();

  });

}

function kill(hook, script, opts) {

  global[hook]('stop remote ' + script, function (done) {

    console.log('TODO: KILL', opts);
    done();

  });

}
