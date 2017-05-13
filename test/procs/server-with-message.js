var MochaFork = require('../..');

MochaFork.onStart(function (done) {

  setInterval(function () {

    MochaFork.send({
      some: 'data'
    });

  }, 50);

  done();

});
