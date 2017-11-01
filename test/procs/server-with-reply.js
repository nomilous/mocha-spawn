var MochaSpawn = require('../..');

MochaSpawn.on('request-from-server', function (arg1, arg2) {

  MochaSpawn.send('reply-from-client', arg1, arg2);

});

MochaSpawn.onStart(function (opts, done) {

  done();

});

MochaSpawn.onStop(function (opts, done) {

  done();

});
