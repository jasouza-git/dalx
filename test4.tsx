#!/usr/bin/env -S deno run -A --watch --unstable-raw-imports
import { Dalx, App, Route, state_type, DOM } from './mod.ts';
import picture from './pic.jpg' with { type:'bytes' };
Dalx.run(x=>eval(x));

function login(c:state_type) {
    const inp = c.document.getElementById<DOM.HTMLInputElement>('pass')!;
    console.log(inp.value);
}

<App name="My Website" host>
    <Route path="/pic.jpg" data={picture} />
    <Route path="/about">
        <h1>ABOUT US</h1>
    </Route>
    <button type="button" onclick={() => {console.log('User clicked!')}}>Click Me!</button>
    <input id="pass" placeholder="Password: "></input>
    <button type="button" onclick={login}>LOGIN</button>
</App>