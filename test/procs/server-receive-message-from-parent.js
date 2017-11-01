var MochaSpawn = require('../..');

MochaSpawn.onStart(function (opts, done) {

  done();

});

MochaSpawn.on('event-name', function (data) {

  if (data.kill) process.exit(1);

});
