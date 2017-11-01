const MochaSpawn = require('../..');

const failPromise = (message) => {

  return new Promise((resolve, reject) => {

    reject(new Error(message))

  });

};

MochaSpawn.onStart(async function (opts) {

  await failPromise('Failed to start');

});

MochaSpawn.onStop(async function (opts, done) {

  await failPromise('Failed to stop');
  done();

});
