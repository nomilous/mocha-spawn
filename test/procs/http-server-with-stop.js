var MochaSpawn = require('../..');
var http = require('http');
var server;

MochaSpawn.onStart(function (opts, done) {

  var onListen, onError;

  server = http.createServer(function (request, response) {
    response.end(process.pid + ' OK');
  });

  onListen = function () {
    server.removeListener('error', onError);
    MochaSpawn.send('started', {pid: process.pid});
    done();
  };

  onError = function (error) {
    server.removeListener('listening', onListen);
    done(error);
  };

  server.once('listening', onListen);

  server.once('error', onError);

  server.listen(opts.port, opts.host);

});

MochaSpawn.onStop(function (opts, done) {

  server.close(done);

});
