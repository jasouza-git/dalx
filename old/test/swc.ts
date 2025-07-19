import { parse, print } from "https://raw.githubusercontent.com/jasouza-git/ext_deno_swc/atp3/mod.ts";

const code = `const x: string = "Hello, Deno SWC!"`;

const ast = parse(code, {
  target: "es2019",
  syntax: "typescript",
  comments: false,
});
console.log(ast);