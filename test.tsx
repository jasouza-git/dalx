/** @jsx Dapp.factory */
import { Dapp, App, State, DOM } from './mod.ts';

/** Client Environment */
const client = State({'login':false});
/** Server Password */
const pass = '$ecretPassword';
/** Logged in session tokens */
const sessions:string[] = [];
/** Checks if user can login */
function check() {
  /** Password Element */
  const inp = client.document.getElementById<DOM.HTMLInputElement>('pass'); // client safe
  if (inp == null) throw new client.Error('Element not found!'); // client safe
  /** Check if valid password */
  if (inp.value == pass) { // Because `pass` is server, switch max default to server thus becomes: $0 = await server(0, inp.value);
    const token = Math.random().toString(36).slice(2);
    const expire = new Date();
    expire.setTime(expire.getTime() + (30*24*60*60*1000));
    sessions.push(token);
    client.document.cookie = `session=${token};expires=${expire.toUTCString()};path=/`; // Back to client(not max default): uses $0.$0 (token), $0.$1 (expire toUTCString)
    client.alert('Accepted');
    client.login = true;
  } else client.alert('Wrong password');
}
/*
async function check() {
  const inp = document.getElementById('pass');
  if (inp == null) throw new Error('Element not found');
  const $0 = await server(0, inp.value); // Returns [match:inp.value == pass, token, expire:expire.toUTCString()]
  if ($0[0]) {
    document.cookie = `session=${$0[1]};expires=${$0[2]};path=/';
    alert('Accepted');
  } else alert('Wrong password');
}
*/

function F(a:string, b:number) {
  // This is semi
  let c = 1, // No scope change
    d = pass, // Forcing scope to be server
    e = client.a, // Forcing scope to be client
    f = () => client.pass == pass, // Uses both but since server scope is higher, switches to server
    g; // Nothing
}
/*
async F(a:string, b:number) {
  const c = 1, e=a, f=async () => await server(0, pass);
}
*/
const app:App = <App name="Simple Logging System" state="client" start={req=>{ // This is executed before HTTP Response
  const session = (req.headers.get('cookie')??'').split('; ').filter(x=>x.split('=')[0]=='session');
  client.login = Boolean(session.length && sessions.includes(session[0].split('=')[1]));
}}>
  <p>{()=>client.login ? 'Logged in' : 'Not Logged in'}</p>
  <input id="pass" type="password"></input>
  <button type="button" onclick={F}>
    Log In
  </button>
</App>

function test() {
  console.log(123);
}
console.log('\x1b[1;32mPARSED:\x1b[0m', Dapp.parse(test, app));
