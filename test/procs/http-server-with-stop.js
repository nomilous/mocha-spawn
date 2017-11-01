var mochaSpawn = require('../..');
var http = require('http');
var server;

mochaSpawn.onStart(function (opts, done) {

  var onListen, onError;

  server = http.createServer(function (request, response) {
    response.end(process.pid + ' OK');
  });

  onListen = function () {
    server.removeListener('error', onError);
    mochaSpawn.send('started', {pid: process.pid});
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

mochaSpawn.onStop(function (opts, done) {

  server.close(done);

});
