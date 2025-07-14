/** @jsx Dalx.jsx */
import { Dalx, App, state_type, DOM } from 'https://raw.githubusercontent.com/jasouza-git/dalx/main/mod.ts';
Dalx.run(x=>eval(x));

const pass = 'secret';

function login(c:state_type) {
    const p = c.document.getElementById<DOM.HTMLInputElement>('pass')!;
    c.document.getElementById('status')!.innerText = p.value == pass ? 'Correct password' : 'Wrong password';
}

<App desk>
    <input id="pass" type="password" />
    <button type="button" onclick={login}>Login</button>
    <p id="status">Not logged in yet</p>
</App>
// #!/usr/bin/env -S deno run --unstable-raw-imports 