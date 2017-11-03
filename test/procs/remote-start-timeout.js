var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  var interval = setInterval(function () {

    // so that process does not exit

  }, 1000);

  // make no call do done so that start times out at test

});
