var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  done('not error if not error');

});

mochaSpawn.onStop(function (opts, done) {

  done('not error if not error');

});
