var MochaFork = require('../..');

MochaFork.start(function (done) {

  setInterval(function () {

    MochaFork.send({
      some: 'data'
    });

  }, 50);

  done();

});
