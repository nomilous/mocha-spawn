var MochaFork = require('../..');
var http = require('http');
var server;

MochaFork.start(function (done, opts) {

  var onListen, onError;

  server = http.createServer(function (request, response) {
    response.end('OK');
  });

  onListen = function () {
    server.removeListener('error', onError);
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

MochaFork.stop(function (done) {

  server.close(done);

});
