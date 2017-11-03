module.exports = Process;

var debug = require('debug')('mocha-spawn:process');

function Process(id, run, opts) {
  debug('starting process %s (%s)', run.script, id);

  this.id = id;
  this.state = 'starting'; // OR running, stopping
  this.run = JSON.parse(JSON.stringify(run));
  this.timestamp = Date.now();
  this.opts = JSON.parse(JSON.stringify(opts));
  this._child = null;
}
