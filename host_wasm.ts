import data from './deno_swc_bg.wasm' with { type:'bytes' };
Deno.serve({
  hostname:'127.0.0.2',
  port: 443,
  cert: await Deno.readTextFile("./cert.pem"),
  key: await Deno.readTextFile("./key.pem"),
}, _req => {
    return new Response(data, {
        status: 200,
        headers: {
            'Content-Type': 'application/wasm',
            'Content-Length': data.byteLength.toString()
        }
    });
})