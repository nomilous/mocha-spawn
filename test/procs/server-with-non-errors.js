var MochaSpawn = require('../..');

MochaSpawn.onStart(function (opts, done) {

  done('not error if not error');

});

MochaSpawn.onStop(function (opts, done) {

  done('not error if not error');

});
