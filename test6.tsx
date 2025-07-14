import { Dalx, App, state_type } from './mod.ts';
Dalx.run(x=>eval(x));

function click(c:state_type) {
    const dom = c.document.getElementsByTagName('h1')[0];
    dom.innerHTML = 'Oh you clicked me!';
}

<App desk>
    <h1>Hello Dalx!</h1>
    <button type="button" onclick={click}>Click</button>
</App>