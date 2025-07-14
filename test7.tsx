#!/usr/bin/env -S deno run --unstable-raw-imports --allow-ffi --allow-write --allow-net --watch
import { Dalx, App } from './mod.ts';
Dalx.run(x=>eval(x));

<App name="My Website" desk>
    <h1>Hello World</h1>
</App>