var MochaFork = require('../..');

MochaFork.onStart(function (opts, done) {

  setInterval(function () {

    MochaFork.send('event-name', {
      some: 'data from child'
    });

  }, 50);

  done();

});
