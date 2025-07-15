/** @jsx Dalx.jsx */
import { Dalx, App, state_type } from '../mod.ts';
Dalx.run(x=>eval(x));

function clicked(c:state_type) {
    c.alert(123);
}
class Test extends Dalx<{text:string}> {
    override content() {
        return <h1 onclick={clicked}>{this.attr.text}</h1>;
    }
}

<App host="80">
    <Test text="Hi" />

    <h1 onclick={(c:state_type) => {
            c.alert(123);
    }}>hi</h1>
</App>


/*await app.render(null, app);
console.log(await app.render());*/