/** @jsx Dalx.jsx */
import { Dalx, App, State, DOM } from './mod.ts';
Dalx.run(x=>eval(x));

const client = State.new({
    x:2,
    set_bg: (c:typeof client, e:DOM.MouseEvent) => {
        c.document.body.style.backgroundColor = 'red';
        c.console.log(e.clientX);
        c.x = e.clientY;
        c.document.getElementById('value')!.innerText = 'User clicked button!';
        console.log('User clicked button at', e.clientX, ',', e.clientY);
    }
});

function check_password(c:typeof client) {
    const inp = c.document.getElementById<DOM.HTMLInputElement>('password')!;
    console.log('User put password:', inp.value);
}

<App host state={client}>
    <h1 id="value">Hello World</h1>
    <button type="button" onclick={client.set_bg}>Set background to Red</button>

    <h1>Login</h1>
    <input id="password" placeholder="Password"></input>
    <button type="button" onclick={check_password}>Check Password</button>
</App>