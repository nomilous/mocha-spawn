var fork = require('./fork');
var child = require('./child');


module.exports.start = function (script, opts) {

  if (typeof script == 'string') {

    return fork.start(script, opts);

  }

  if (typeof script == 'function') {

    return child.start(script);

  }

};


module.exports.stop = function (script) {

  if (typeof script == 'string') {

    return fork.stop(script);

  }

  if (typeof script == 'function') {

    return child.stop(script);

  }

};
