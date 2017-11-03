var mochaSpawn = require('../..');
var interval;

mochaSpawn.onStart(function (opts, done) {

  interval = setInterval(function () {

    // so that process does not exit

  }, 1000);

  // call done with error so that start errors at test

  done();

});
