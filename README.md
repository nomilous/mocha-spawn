[![npm](https://img.shields.io/npm/v/mocha-fork.svg)](https://www.npmjs.com/package/mocha-fork)[![Build Status](https://travis-ci.org/nomilous/mocha-fork.svg?branch=master)](https://travis-ci.org/nomilous/mocha-fork)[![Coverage Status](https://coveralls.io/repos/github/nomilous/mocha-fork/badge.svg?branch=master)](https://coveralls.io/github/nomilous/mocha-fork?branch=master)

# mocha-fork

Mocha hooks to start/stop background proccess in tests.

```
npm install mocha-fork --save-dev
```

### API

#### In the child process script

These functions are for use in child processes as spawned from the mocha tests.

eg. in `./test/procs/background-service.js`

```javascript
var MochaFork = require('mocha-fork');
var MyServiceBeingTested = require('../..');

var service = new MyServiceBeingTested();

MochaFork.onStart(function (opts, done) {
  // Called when the test starts this script as child process.
  
  // Send event up to the test in parent process.
  MochaFork.send('event-name', {some: 'data'}, 'more');
  
  // Call done once the child is fully up.
  service.start(opts, function (e) {
    done(e);
  });
});

MochaFork.onStop(function (done) {
  // Called when a test stops this child process.
  // Only necessary when using MochaFork.after.stop() in the test.
  
  service.stop(done);
});
```

##### MochaFork.onStart(fn)

Define the function `fn` that should be run to start things up in the child process. The function will be called with opts as passed to `MochaFork.before.start(scriptPath[, opts])` and a callback `done` to signal to signal that the child process is ready.

##### MochaFork.onStop(fn)

Define the function `fn` that shoud be called to tear down the child process (stop whatever service it's running). This is used by `MochaFork.after.stop(scriptPath)`.

##### MochaFork.send(eventName[, data...])

Send event up to the test in parent process. see `MochaFork.before.start(scriptPath[, opts])`

#### In the mocha test script

These functions are for creating mocha before and after hooks to spawn the child processes.

eg. in `./test/with-background-process.js`

```javascript
var MochaFork = require('mocha-fork');
var path = require('path');

describe('with background process', function () {
  
  var scriptPath = path.resolve(__dirname, 'procs', 'background-service');
  var scriptOpts = {};
  
  // create before hook that spawns script before tests
  MochaFork.before.start(scriptPath, scriptOpts);
  
  // create after hook that stops script after tests
  MochaFork.after.stop(scriptPath);
  // MochaFork.after.kill(scriptPath);
  
  it('test', function () {});
  
});
```

##### MochaFork.before.start(scriptPath[, opts])

Creates a mocha before hook that starts the script in a child process and passes opts to `onStart(fn)` .

__NB:__ Requires use of `MochaFork.after.stop(scriptPath)` or `MochaFork.after.kill(scriptPath)` otherwise the child process will not be stopped.

__NB:__ `scriptPath` is used as key in list of running child processes. This means that the same script cannot be used more than once in a test file.

Returns an `EventEmitter` instance (including `._child` containing the actual child process)

###### Event: 'exit'

Emitted with `code` and `signal` when the child process exits.

###### Event: custom events

Custom events as emitted from child using `MochaFork.send(eventName[, data...])`.

##### MochaFork.after.stop(scriptPath)

Creates a mocha after hook to stop the child process. Requires that the child script defines the stop function with `MochaFork.onStop(fn)`. 

This and is useful to ensure the service running in the child stops cleanly without requiring a `kill`.

##### MochaFork.after.kill(scriptPath)

Creates a mocha after hook to kill the background process.

##### MochaFork.beforeEach.start(scriptPath[, opts])

Similar to `MochaFork.before.start(scriptPath[, opts])` except that it starts background script in mocha beforeEach hook. 

##### MochaFork.afterEach.stop(scriptPath)

Similar to `MochaFork.after.stop(scriptPath)`.

##### MochaFork.afterEach.kill(scriptPath)

Similar to `MochaFork.after.kill(scriptPath)`.

### With async/await

requires node ^7.10.0

The child script can use async/await functions.

eg. in `./test/procs/background-service.js`

```javascript
const MochaFork = require('mocha-fork');
const MyServiceBeingTested = require('../..');

var service;

MochaFork.onStart(async function (opts) {
  // create() returns promise of service
  service = await MyServiceBeingTested.create(opts);
});

MochaFork.onStop(async function () {
  await service.stop();
});
```

