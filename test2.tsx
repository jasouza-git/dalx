#!/usr/bin/env -S deno run -A --watch --unsafely-ignore-certificate-errors=deno.land
import { Dalx, State } from './mod.ts';
Dalx.run(x=>eval(x));

const client = State.new();


const guess = Math.floor(Math.random()*100);

function serve(n:number) {
    console.log('User says', n);
}

function f(c:typeof client) {
    const n = c.x;
    console.log('N is', c.x, n);
    c.x = guess;
    serve(c.x as number);
    /*c.console.log('Hello Client!');
    const n = Number(c.prompt('Enter number:'));
    const m = Number(c.prompt('Enter new number:'));
    console.log('Hello Server!', n);
    console.log('Hello again Server!', n);
    console.log('Hello again again Server!', m, n);
    c.console.log('Back to you client!');*/
}

Dalx.parse(client, f);