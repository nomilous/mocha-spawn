var MochaSpawn = require('../..');

MochaSpawn.onStart(function (opts, done) {

  setInterval(function () {

    MochaSpawn.send('event-name', {
      some: 'data from child'
    }, 'more');

  }, 50);

  done();

});
