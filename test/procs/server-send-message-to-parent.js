var mochaSpawn = require('../..');

mochaSpawn.onStart(function (opts, done) {

  setInterval(function () {

    mochaSpawn.send('event-name', {
      some: 'data from child'
    }, 'more');

  }, 50);

  done();

});
