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

MochaFork.on('event-from-parent', function (some, data) {});

MochaFork.onStart(function (opts, done) {
  // Called when the test starts this script as child process.
    
  service.start(opts, function (e) {
    // Call done once the child is fully up.
    done(e);
    
    // Send event up to the test in parent process.
    MochaFork.send('event-name-1', {some: 'data'}, 'more');
  });
});

MochaFork.onStop(function (opts, done) {
  // Called when a test stops this child process.
  // Only necessary when using MochaFork.after.stop([opts]) in the test,
  // as opposed to MochaFork.after.kill().
  
  service.stop(done);
});
```

##### MochaFork.onStart(fn)

Define the function `fn` that should be run to start things up in the child process. The function will be called with `opts` as passed to `MochaFork.before.start(scriptPath[, opts])` and a callback `done` to signal that the child process is ready.

##### MochaFork.onStop(fn)

Define the function `fn` that shoud be called to tear down the child process (stop whatever service it's running). This is used by `MochaFork.after.stop([opts])`. The  `fn` receives the `opts` from `childRef.after.stop([opts])` and `done` to signal that the tear down is complete.

##### MochaFork.send(eventName[, data...])

Send event up to the test in parent process. see `childRef.send(eventName[, data...])`

##### MochaFork.on(eventName, handler)

Receive event from parent process.

#### In the mocha test script

These functions are for creating mocha before and after hooks to spawn the child processes.

eg. in `./test/with-background-process.js`

```javascript
var MochaFork = require('mocha-fork');
var path = require('path');

describe('with background process', function () {
  
  var scriptPath = path.resolve(__dirname, 'procs', 'background-service');
  var scriptStartOpts = {};
  var scriptStopOpts = {};
  
  // create before hook that spawns script before tests
  var childRef = MochaFork.before.start(scriptPath, scriptStartOpts);
  
  // subscribe to events from the child script
  childRef.on('event-name-1', function (data, more) {});
  
  // create after hook that stops script after tests
  childRef.after.stop(scriptStopOpts);
  // hookRef.after.kill(scriptStopOpts);
  
  it('test', function (done) {
    
    // interact with child through events
    
    childRef.on('event-name-2-reply', function (some, stuff) {
      done();
    });
    
    childRef.send('event-name-2', some, stuff);
    
  });
  
});
```

##### MochaFork.before.start(scriptPath[, opts])

Creates a mocha before hook that starts the script in a child process and passes opts to `onStart(fn)` .

Include opts.timeout in milliseconds to adjust hook timeout.

Returns `childRef` for creating corresponding mocha after hooks to stop the child process or interacting with the child process.

##### childRef.after.stop([opts])

Creates a mocha after hook to stop the child process. Requires that the child script defines the stop function with `MochaFork.onStop(fn)`. 

This is useful to ensure the service running in the child stops cleanly without requiring a `kill`.

If the hook times out it means that the child did not relinquish all resources (eg. still listening on socket or running a setInterval)

Include opts.timeout in milliseconds to adjust hook timeout.

##### childRef.after.kill([opts])

Creates a mocha after hook to kill the background process.

Include opts.timeout in milliseconds to adjust hook timeout.

Does not call `fn` as assigned in `MochaFork.onStop(fn)` in the client script.

##### childRef.on(eventName, handler)

Handle events sent from child process using as sent using `MochaFork.send(eventName[, data...])`.

###### Event: 'exit'

Emitted with `code` and `signal` when the child process exits.

###### Event: custom events

Custom events as emitted from child.

##### childRef.send(eventName[, data...])

Send events to child process. The child subscribes with `MochaFork.on(eventName, handler)`.

##### MochaFork.beforeEach.start(scriptPath[, opts])

Similar to `MochaFork.before.start(scriptPath[, opts])` except that it starts background script in mocha beforeEach hook.

Returns `childRef` 

##### childRef.afterEach.stop([opts])

Similar to `MochaFork.after.stop([opts])`.

##### childRef.afterEach.kill([opts])

Similar to `MochaFork.after.kill([opts])`.

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

MochaFork.onStop(async function (opts) {
  await service.stop();
});
```

