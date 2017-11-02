module.exports = Process;

var debug = require('debug')('mocha-spawn:process');
var shortid = require('shortid');

function Process(run, opts) {
  this.id = shortid.generate();
  this.run = run;
  this.state = 'starting'; // OR running, stopping

  debug('starting process %s %s', this.id, run.script);

  Object.defineProperty(this, 'timestamp', {
    value: Date.now(),
    wrritable: true
  });

  Object.defineProperty(this, 'opts', {
    value: opts
  });

}
