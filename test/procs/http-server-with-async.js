const mochaSpawn = require('../..');
const HttpServer = require('./http-server-promise');

// var server = new HttpServer();
var server;

mochaSpawn.onStart(async function (opts) {

  // await server.start(opts);
  server = await HttpServer.create(opts);

});

mochaSpawn.onStop(async function () {

  console.log('STOP 1');

  await server.stop();

});
