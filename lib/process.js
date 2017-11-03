module.exports = Process;

function Process(id, run, opts) {
  this.id = id;
  this.timestamp = Date.now();
  this.state = 'starting'; // OR running, stopping
  this.run = JSON.parse(JSON.stringify(run));
  this.opts = JSON.parse(JSON.stringify(opts));
  this._child = null;
}
