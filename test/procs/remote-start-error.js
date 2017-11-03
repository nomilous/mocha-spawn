var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  var interval = setInterval(function () {

    // so that process does not exit

  }, 1000);

  // call done with error so that start errors at test

  done(new Error('Some start error.'));

});
