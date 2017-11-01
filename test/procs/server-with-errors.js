var MochaSpawn = require('../..');

MochaSpawn.onStart(function (opts, done) {

  done(new Error('Failed to start'));

});

MochaSpawn.onStop(function (opts, done) {

  done(new Error('Failed to stop'));

});
