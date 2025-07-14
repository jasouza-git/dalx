/** @jsx Dapp.factory */
import { Dapp, App, State } from './mod.ts';

const genv = State({host:null} as {host:string|null});
const cenv = State();

const _main = <App name="Main App" desk={[200,200]} state={genv}>
    <h1>Main App</h1>
    <p>{() => genv.host ? `Hosting at ${genv.host}` : 'Not Hosting'}</p>
    <button type="button" onlick={() => genv.host = genv.host ? null : '127.0.0.2:80'}>
        {() => genv.host ? 'Stop Hosting' : 'Host'}
    </button>
</App>

const _server = <App name="Second App" host={genv.host} state={cenv}>
    <h1>This is my server at {genv.host}</h1>
    
</App>