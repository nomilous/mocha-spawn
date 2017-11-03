var mochaSpawn = require('../..');

mochaSpawn.on('request-from-server', function (arg1, arg2) {

  mochaSpawn.send('reply-from-client', arg1, arg2);

});

mochaSpawn.onStart(function (opts, done) {

  done();

});

mochaSpawn.onStop(function (opts, done) {

  done();

});
