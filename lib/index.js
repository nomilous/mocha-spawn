var fork = require('./fork');
var child = require('./child');

module.exports.start = fork.start;

module.exports.stop = fork.stop;

module.exports.kill = fork.kill;

module.exports.onStart = child.start;

module.exports.onStop = child.stop;

module.exports.send = function (data) {

  process.send({
    action: 'message',
    data: data
  });

};
