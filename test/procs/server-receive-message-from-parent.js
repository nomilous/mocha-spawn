var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  done();

});

mochaSpawn.on('event-name', function (data) {

  if (data.kill) process.exit(1);

});
