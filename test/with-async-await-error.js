var MochaFork = require('..');
var path = require('path');
var fetchUrl = require('fetch').fetchUrl;
var expect = require('expect.js');
var semver = require('semver');

if (!semver.satisfies(process.version, '^7.10.0')) return;

describe('with async await error', function () {

  it('xxx');

});
