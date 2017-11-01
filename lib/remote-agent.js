module.exports = RemoteAgent;

var io = require('socket.io');
var https = require('https');
var pem = require('pem');

function RemoteAgent(options) {
  Object.defineProperty(this, 'apikey', {
    value: options.apikey || 'apikey'
  });
  Object.defineProperty(this, 'groups', {
    value: options.groups || ['all']
  });
  Object.defineProperty(this, 'host', {
    value: options.host || 'localhost'
  });
  Object.defineProperty(this, 'port', {
    value: options.port || 59595
  });
  Object.defineProperty(this, 'key', {
    value: options.key || null
  });
  Object.defineProperty(this, 'cert', {
    value: options.cert || null
  });
}
