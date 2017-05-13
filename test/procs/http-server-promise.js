var http = require('http');

class HttpServer {

  static create(opts) {

    let server = new HttpServer();

    return server.start(opts);

  }

  start(opts) {

    return new Promise((resolve, reject) => {

      let onListen, onError;

      this.server = http.createServer((req, res) => {
        res.end('ASYNC SERVER OK');
      });

      onListen = () => {
        this.server.removeListener('error', onError);
        resolve(this);
      };

      onError = (error) => {
        this.server.removeListener('listening', onListen);
        delete this.server;
        reject(error);
      };

      this.server.once('listening', onListen);

      this.server.once('error', onError);

      this.server.listen(opts.port, opts.host);

    });

  }

  stop() {

    return new Promise((resolve, reject) => {

      if (!this.server) return resolve();

      this.server.close(error => {
        if (error) return reject(error);
        resolve();
      });

    });

  }

}

module.exports = HttpServer;
