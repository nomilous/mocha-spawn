const Mochapawn = require('../..');
const HttpServer = require('./http-server-promise');

// var server = new HttpServer();
var server;

MochaSpawn.onStart(async function (opts) {

  // await server.start(opts);
  server = await HttpServer.create(opts);

});

MochaSpawn.onStop(async function () {

  console.log('STOP 1');

  await server.stop();

});
