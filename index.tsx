/** @jsx Dapp.factory */
import { MouseEvent } from './type.ts';
import { Dapp/*, HTMLElement, App, Route*/, State } from './mod.ts';

const client = State({msg:'Not Clicked'});
function y(e:MouseEvent) { // send('func_id', console.log('Hello Client!'), document.title); 
    e.clientX
    console.log('Hello Server!');
    client.console.log('Hello Client!');
    const title:string = client.document.title;
    console.log('The title of Client is '+title);
}
/*
// From Client
send('y',console.log('Hello Client!'), document.title);
// In Server
function

const client = State({a:1,b:2,c:0});
function A_original() {
    client.c = client.a + client.b;
}
function A_client() {
    c = a + b;
}
function A_server() {
}

let b = 2;
function Ao() {
    client.c = client.a+b;  // Client depends on Server(b) : Server(b)->Client
    console.log(client.c);  // Server depends on Client(c) : Server(b)->Client(c)->Server
    b = client.func(b) // Client Depends on Server(b) that depends on client (func)
}
const As = [
    // Client
    (b) => {
        c = a+b; // Line 1
        return [c];
    },
    // Server
    (c) => {
        console.log(c); // Line 2
        return [b];
    },
    // Client
    (b) => {
        return [func(b)]; // Part of Line 3
    },
    // Server
    (unlabled) => {
        b = unlabled; // Part of Line 3
    }
];
*/
const x = <button type="button" onclick={y}>Hello</button>;
console.log(await x.render());


/*
import file from './msg.txt' with { type:'text' };
import pic from './pic.jpg' with { type:'bytes' };

const client = State({msg:'Not Clicked',note:'This data is visible to client side'});
const backend = State({clicked:0}, true);
function click() {
    client.msg = 'User Clicked';
    backend.clicked++;
}

<App name="My App" host state={[client, backend]}>
    <Route path="/msg.txt" data={file} />
    <Route path="/pic.jpg" data={pic} />
    <h1>Hello World</h1>
    <Route path="/about">
        <p>About Us</p>
    </Route>
    <button type="button" onclick={click}>Click Me</button>
    <p>{client.msg}</p>
</App>
*/
