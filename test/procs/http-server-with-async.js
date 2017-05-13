const MochaFork = require('../..');
const HttpServer = require('./http-server-promise');

// const server = new HttpServer();
let server;

MochaFork.onStart(async function (done, opts) {

  // await server.start(opts);
  server = await HttpServer.create(opts);
  done();

});

MochaFork.onStop(async function (done) {

  await server.stop();
  done();

});
