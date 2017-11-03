var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  done(new Error('Failed to start'));

});

mochaSpawn.onStop(function (opts, done) {

  done(new Error('Failed to stop'));

});
