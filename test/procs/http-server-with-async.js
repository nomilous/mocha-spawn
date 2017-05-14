const MochaFork = require('../..');
const HttpServer = require('./http-server-promise');

// var server = new HttpServer();
var server;

MochaFork.onStart(async function (opts) {

  // await server.start(opts);
  server = await HttpServer.create(opts);

});

MochaFork.onStop(async function () {

  console.log('STOP 1');

  await server.stop();

});
