var MochaFork = require('../..');

MochaFork.onStart(function (done) {

  setInterval(function () {

    MochaFork.send('event-name', {
      some: 'data from child'
    });

  }, 50);

  done();

});
