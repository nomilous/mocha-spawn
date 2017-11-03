module.exports = Process;

function Process(id, run, opts) {
  this.id = id;
  this.state = 'starting'; // OR running, stopping
  this.run = JSON.parse(JSON.stringify(run));
  this.timestamp = Date.now();
  this.opts = JSON.parse(JSON.stringify(opts));
  this._child = null;
}
