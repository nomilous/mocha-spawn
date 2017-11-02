[![npm](https://img.shields.io/npm/v/mocha-spawn.svg)](https://www.npmjs.com/package/mocha-spawn)[![Build Status](https://travis-ci.org/nomilous/mocha-spawn.svg?branch=master)](https://travis-ci.org/nomilous/mocha-spawn)[![Coverage Status](https://coveralls.io/repos/github/nomilous/mocha-spawn/badge.svg?branch=master)](https://coveralls.io/github/nomilous/mocha-spawn?branch=master)

# mocha-spawn

Mocha hooks to start/stop background local or remote proccesses in tests.









TRY ON NODE 0.x.x









```
npm install mocha-spawn --save-dev
```

```javascript
const mochaSpawn = require('mocha-spawn');
```



## In the parent process (the test script)



### mochaSpawn.before.start(run[, opts])
### mochaSpawn.beforeEach.start(run[, opts])

 * `run` \<Object> 
    * `script` \<string> Absolute path to the script to run in the child process.
    * `timeout` \<number> Hook timeout if 2000ms is undesirable.
 * `opts` \<Object> Optional. Parameters to pass to the starting child.
 * Returns \<childRef> A reference to the child facilitation further interaction.

Creates a `before` or `beforeEach` hook that starts the child process accordingly.

The `opts` will be passed to the [mochaSpawn.onStart(fn)](#mochaspawnonstartfn) handler `fn` in the child script.

The returned `childRef` will be used for intraprocess communication and to create the necesary `after` or `afterEach` hooks to stop the child where necessary.



### childRef.after.stop([run]\[, opts])
### childRef.afterEach.stop([run]\[, opts])

* `run` \<Object> Optional.
  * `timeout` \<number> Hook timeout if 2000ms is undesirable.
* `opts` \<Object> Optional stopping parameters to pass to the child.

Creates an `after` or `afterEach` hook in the test to stop the child process cleanly. In other words, to call the [mochaSpawn.onStop(fn)](#mochaspawnonstopfn) in the client script and allow the child to tear itself down neatly with whatever code was placed in that handler `fn` - and then wait for the child to exit.

If the hook times out it means that the child did not relinquish all resources (eg. still listening on socket or running a setInterval). Try [childRef.after.kill([opts])](#childrefafterkillopts) if all else fails.

Pass `run` as null of `opts` are required without it.



Example:

```javascript
var mochaSpawn = require('mocha-spawn');
var path = require('path');

describe('with background process', function () {

  var scriptPath = path.resolve(__dirname, 'procs', 'background-script.js');
  var scriptStartOpts = {};
  var scriptStopOpts = {};

  // create before hook that spawns script before tests
  var childRef = mochaSpawn.before.start(scriptPath, scriptStartOpts);

  // create after hook that stops script after tests
  childRef.after.stop(scriptStopOpts);

  it('can', function () {

  });

});
```



### childRef.after.kill([run])
### childRef.afterEach.kill([run])

* `run` \<Object> Optional.
  * `timeout` \<number> Hook timeout if 2000ms is undesirable.

Creates an `after` or `afterEach` hook to kill the child process. Does not call  [mochaSpawn.onStop(fn)](#mochaspawnonstopfn) handler `fn` in the child process.



### childRef.on(eventName, handler)

Handle events sent from the child process using as sent using [mochaSpawn.send(eventName[, data…])](#mochaspawnsendeventname-data).

#### Event: 'exit'

Emitted with `code` and `signal` when the child process exits.

#### Event: custom events

Custom events as emitted from child.



### childRef.send(eventName[, data...])

Send events to child process. The child subscribes with [mochaSpawn.on(eventName, handler)](#mochaspawnoneventname-handler).

Functions cannot be sent to the child process.



Example:

```javascript
it('test', function (done) {

  // interact with child through events

  childRef.on('some-thing-result', function (results) {
    expect(results).to.eql({ /*...*/ });
    done();
  });

  childRef.send('do-some-thing', params);

});
```



## In the child process script



### mochaSpawn.onStart(fn)

* `fn` \<Function> The handler to start the client script when called by parent.

Define the function `fn` that should be run to start things up in the child process. The function will be called with `opts` as passed from the parent in [mochaSpawn.before.start(scriptPath[, opts])](#mochaspawnbeforestartscriptpath-opts) as well as a callback `done` to signal that the child process is ready.



### mochaSpawn.onStop(fn)

* `fn` \<Function> The handler to stop the client script when called by parent.

Define the function `fn` that shoud be called to tear down the child process (stop whatever service it's running). The  `fn` receives the `opts` as passed to [childRef.after.stop([opts])](#childrefafterstopopts) in the parent as well as a `done` function to signal that the tear down is complete.



Example:

```javascript
var mochaSpawn = require('mocha-spawn');
var MyServiceBeingTested = require('../..');

var myService = new MyServiceBeingTested();

mochaSpawn.onStart(function (opts, done) {

  myService.start(opts, function (e) {
    done(e);
  });

});

mochaSpawn.onStop(function (opts, done) {

  myService.stop(done);

});
```



### mochaSpawn.send(eventName[, data...])

Send event up to the test in parent process.



### mochaSpawn.on(eventName, handler)

Receive event from parent process.



Example:

```javascript
mochaSpawn.on('do-some-thing', function (params) {

  myService.doSomething(params, function (err, results) {

    mochaSpawn.send('some-thing-result', err, results);

  });

});
```



## With async/await

requires node >=7.10.0

The child script can use async/await functions.

Example:

```javascript
const mochaSpawn = require('mocha-spawn');
const MyServiceBeingTested = require('../..');

var service;

mochaSpawn.onStart(async function (opts) {
  // create() returns promise of service
  service = await MyServiceBeingTested.create(opts);
});

mochaSpawn.onStop(async function (opts) {
  await service.stop();
});
```
