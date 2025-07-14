import { Dalx, App, state_type, DOM } from './mod.ts';
Dalx.run(x=>eval(x));

function send(c:state_type) {
    const inp = c.document.getElementById<DOM.HTMLInputElement>('msg')!;
    console.log('User says "' + inp.value + '"');
    inp.value = '';
}

const pass = 'password';
function check(c:state_type) {
    const ps = c.document.getElementById<DOM.HTMLInputElement>('pass')!;
    c.alert(pass);
}

<App name="My Website" desk>
    <input id="msg" placeholder="Message:"></input>
    <button type="button" onclick={send}>Send</button>
    <br/><br/>
    <input id="pass" placeholder="Password:"></input>
    <button type="button" onclick={check}>Check</button>
</App>