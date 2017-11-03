const mochaSpawn = require('../..');

const failPromise = (message) => {

  return new Promise((resolve, reject) => {

    reject(new Error(message))

  });

};

mochaSpawn.onStart(async function (opts) {

  await failPromise('Failed to start');

});

mochaSpawn.onStop(async function (opts, done) {

  await failPromise('Failed to stop');
  done();

});
