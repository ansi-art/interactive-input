interactive-input
============================
Get browser-like input on the command line in pure JS using ansi escape codes.

Usage
-----

```js
const tracker = new InteractiveInput({});
process.stdin.setRawMode(true);
process.stdin.on('data', (buffer) => {
    tracker.consume(buffer.toJSON());
});
tracker.start();
const gracefulTerminate = ()=>{ tracker.stop(); };
process.on('SIGTERM', gracefulTerminate);
process.on('SIGINT', gracefulTerminate);
tracker.on('keypress', (event)=>{
    if(event.key === 'Escape'){
        gracefulTerminate();
        process.exit();
    }
});
tracker.on('mouseup', (event)=>{ /* ... */  });
tracker.on('mousedown', (event)=>{ /* ... */  });
tracker.on('mousemove', (event)=>{ /* ... */  });
```

Testing
-------

Run the es module tests to test the root modules
```bash
npm run import-test
```
to run the same test inside the browser:

```bash
npm run browser-test
```
to run the same test headless in chrome:
```bash
npm run headless-browser-test
```

to run the same test inside docker:
```bash
npm run container-test
```

Run the commonjs tests against the `/dist` commonjs source (generated with the `build-commonjs` target).
```bash
npm run require-test
```

Development
-----------
All work is done in the .mjs files and will be transpiled on commit to commonjs and tested.

If the above tests pass, then attempt a commit which will generate .d.ts files alongside the `src` files and commonjs classes in `dist`

