/** @jsx Dalx.jsx */
import { Dalx, App } from '../mod.ts';
Dalx.run(x=>eval(x));

const txt = [<h1>Hi</h1>, <h2>Hi2</h2>, <h3>Hi3</h3>];
<App host>
    {txt}
</App>