const MochaFork = require('../..');

const failPromise = (message) => {

  return new Promise((resolve, reject) => {

    reject(new Error(message))

  });

};

MochaFork.onStart(async function (opts) {

  await failPromise('Failed to start');

});

MochaFork.onStop(async function (done) {

  await failPromise('Failed to stop');
  done();

});
