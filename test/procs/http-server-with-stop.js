var MockaFork = require('../..');
var http = require('http');
var server;

MockaFork.start(function (done, opts) {

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

MockaFork.stop(function (done) {

  server.close(done);

});
