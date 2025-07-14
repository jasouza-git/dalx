/** # Dalx
 * **Dalx** *(dal-eks)* - Deno-based Application Library eXtension
 * - `Deno-based` **Platform** - Built exclusively for the Deno runtime, leveraging its native TypeScript support, secure execution model, and modern tooling
 * - `Application` **Objective** - Its goal is application development either has a web or native app
 * - `Library` **Type** - Is designed has a library to be imported
 * - `eXtension` **Future** - If polished then could be built-in the Deno engine to achieve its goal to "Uncomplicate JavaScript"
 *
 * What makes Dalx unique compared to the alternatives are:
 * - **Integrated Client/Server Processing** - No need to create seperate instances of code for server and client *(e.g. Hosting/Windows/Automation)*, instead they are automatically seperated through Javascript Parsing *(SWC)* at Runtime
 * - **Singular Codebase** - No need to use multiple programming languages like HTML,CSS,JS,SQL,etc. when creating applications because Dalx provides built-in native-like features like `Data` class when dealing with databases, and IntrinsicElement to deal with HTML and more custom elements
 * 
 * ## Documentation
 * - [`Dalx`](~/Dalx.html) - Main element class
 *   - Element Related
 *     - `constructor(attr:objstr={}, children:unknown[]=[])` - Initializes Dalx element
 *     - `attr:objstr={}` - Attributes of element
 *     - `children:unknown[]=[]` - Children of elements
 *   - JSX Processing
 *     - `static jsx()` - JSX Factory
 *     - `content()` *(overridden)* - Returns the proccessed content
 *     - `render()` - Renders element to string or response
 *   - State Processing
 *     - `static states:state_record[]=[]`
 *     - `static parse_func()`
 * - `HTMLElement` - HTML Elements
 *   - `tag` - HTML Tag
 * - `Route` - Routes data to server
 *   - `path` - Path to routed data
 *   - `data` - Data to provide
 *   - `type` - Mime type of response *(Automatic)*
 * - `App` - Main applications
 *   - `host` - Host application
 *   - `name` - Name of application
 *   - `server` - Server
 *   - `state` - State of clients
 * - `State` - State handler
 * - `Scope` - Scope handler
 *   - `state` - State variable name *(First argument of the main function)*
 *   - `namespace` - Namespace backend? *(true:backend, false:frontend, null:undetermined)*
 * @module
 */
import * as DOM from "./type.ts";
import * as swc from "https://deno.land/x/swc@0.2.1/mod.ts";
import * as swct from "https://esm.sh/@swc/core@1.2.212/types.d.ts";
import { contentType } from "https://deno.land/std@0.224.0/media_types/mod.ts";
export { DOM };

/* ----- TYPES ----- */
export type objstr = Record<string, unknown>;
export type state_type<T extends objstr = objstr> = T & State<T> & DOM.Window;
export type embedded_function<
  T extends objstr = objstr,
  A extends unknown[] = unknown[],
> = (
  /** State Instance */
  c: state_type<T>,
  ...args: A
) => unknown;
export type state_function<T extends objstr = objstr, A extends unknown[] = unknown[]> = {
  /** To be parsed function for identification *(We dont include inner functions cause they might have similar content but different context)* */
  id: embedded_function<T, A>;
  /** Front end equivelent code */
  front: string;
};
export type state_record<T extends objstr = objstr, A extends unknown[] = unknown[]> = {
  id: State<T>;
  ctx: T;
  funcs: state_function<T,A>[];
};
export type swc_node =
  | swct.Declaration
  | swct.Expression
  | swct.Pattern
  | swct.VariableDeclarator
  | swct.ModuleItem
  | swct.Super
  | swct.Import
  | swct.Statement;

/* ----- NAMESPACES ----- */
/** Set global JSX IntrinsicElements */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [tag: string]: unknown;
    }
  }
}

/* ----- Special Classes ----- */
/** State handler */
export class State<T extends objstr = objstr> {
  constructor(data: T = {} as T) {
    this.context = data;
    const out = new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target.context) {
          return target.context[prop as keyof typeof target.context];
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value) => {
        target.context[prop as keyof typeof target.context] = value;
        return true;
      },
    }) as unknown as state_type<T>;
    Dalx.states.push({
      id: out,
      ctx: data,
      funcs: this.functions,
    } as state_record);
    return out;
  }
  /** Default/Starting state context for client side state */
  private context: T;
  /** Parsed functions */
  private functions: state_function<T, unknown[]>[] = [];
  /** Backend functions */
  private back: string[] = []; //Function[] = []; //((...arg: unknown[]) => unknown[])[] = [];
  /** Creates a new state handler, use this instead of traditional `new` for type handling */
  static new<T extends objstr>(data: T) {
    return Object.assign(new State<T>(data), data) as state_type<T>;
  }
  /** Encodes function to client and server sided
   * > Note that for now it treats functions and lambdas as equals so do not use `this`, `arguments`, `super`, and `new.target`
   */
  encode(func: embedded_function<T>): number | null {
    //const funcs = this.functions;
    //const backs = this.back;
    /** Parsed Function has Javascript Tokens */
    const parsed = swc.parse(String(func), {
      syntax: "ecmascript",
      target: "es2022",
    });
    /** Scope to keep track of encoding process */
    class Scope {
      /** Is Main function? *(The function directly being encoded not because of other functions)* */
      main: boolean = true;
      /** Currently maximizing backend? */
      //back: boolean = false; // REMOVE
      /** State variable name *(The first argument of the main function)* */
      state: string = "";
      /** Namespace backend? *(true=backend, false=frontend, null=undetermined)* */
      namespace: { [name: string]: boolean | null } = {};
      /** Backend Functions */
      //funcback:string[] = []; // REMOVE?
      /** No of server responses */
      //resno:number; //
      /** Backend dependencies */
      backs: swct.Expression[] = [];
      constructor(from: Scope | null = null) {
        if (from != null) {
          this.main = from.main;
          //this.back = from.back;
          this.state = from.state;
          this.namespace = this.clone(from.namespace);
          //this.funcback = this.clone(from.funcback);
          this.backs = this.clone(from.backs);
        }
      }
      private clone<T>(data: T): T {
        if (data === null || typeof data !== "object") return data;
        if (Array.isArray(data)) return data.map(this.clone) as T;
        const cloned: T = {} as T;
        for (const key in data) cloned[key] = this.clone(data[key]);
        return cloned;
      }
    }
    /** Deep checks if two data are equal *
    function equal(a:any, b:any) {
      if (a === b) return true;
      if (
        typeof a !== "object" || a === null ||
        typeof b !== "object" || b === null
      ) return false;

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key) || !equal(a[key], b[key])) {
          return false;
        }
      }

      return true;
    }
    /** Modifies a function */
    function modify(
      ftmp: swct.FunctionDeclaration | swct.ArrowFunctionExpression,
      state: State<T>,
      scope = new Scope(),
    ): number {
      /** Unified function type */
      const f: swct.ArrowFunctionExpression =
        ftmp.type == "ArrowFunctionExpression" ? ftmp : {
          type: "ArrowFunctionExpression",
          span: ftmp.identifier.span,
          params: ftmp.params.map((x) => x.pat),
          body: ftmp.body,
          async: ftmp.async,
          generator: ftmp.generator,
          typeParameters: ftmp.typeParameters,
          returnType: ftmp.returnType,
        };
      /** Check if function was already encoded */
      const match = state.functions.map((x, n) => ({ id: n, val: x })).filter(
        (x) => x.val.id == (scope.main ? func : f), // TODO Compare objects not just object reference
      );
      if (match.length) return match[0].id;
      scope.main = false;
      /** Output */
      state.functions.push({
        id: func,
        front: "",
      });
      /** Parse Arguments in namespace and scope's state name */
      f.params.map((x) => x.type == "Identifier" ? x.value : null)
        .filter((x) => x != null).forEach((arg, n) => {
          scope.namespace[arg] = false;
          if (!n && !scope.state.length) scope.state = arg;
        });
      /** Function Commands */
      const lines = f.body.type == "BlockStatement" ? f.body.stmts : [{
        type: "ReturnStatement",
        span: f.span,
        argument: f.body,
      } as swct.ReturnStatement];
      function deparse(node: swct.Expression): string {
        return swc.print({
          type: "Module",
          span: { start: 0, end: 0, ctxt: 0 },
          body: [
            {
              type: "ExpressionStatement",
              span: { start: 0, end: 0, ctxt: 0 },
              expression: node,
            },
          ],
          interpreter: "",
        }).code.slice(3, -2);
      }
      /** Check if within scope */
      function inscope(
        node: swct.Node,
      ): { in: boolean; values: swct.Node[]; state: boolean } { // {in:boolean, group:boolean}
        //if (false) {}
        // Statement
        if (node.type == "ExpressionStatement") {
          return inscope((node as swct.ExpressionStatement).expression);
        } // a = b
        else if (node.type == "AssignmentExpression") {
          const nnode = node as swct.AssignmentExpression;
          const res0 = inscope(nnode.left),
            res1 = inscope(nnode.right);
          //const lines = [...res0.lines, ...res1.lines];
          if (res0.in && !res1.in) {
            f.async = true;
            scope.backs.push(nnode.right);
            nnode.right = {
              type: "MemberExpression",
              span: { start: 0, end: 0, ctxt: 0 },
              object: {
                type: "Identifier",
                span: { start: 0, end: 0, ctxt: 0 },
                value: `$${state.back.length}`,
                optional: false,
              },
              property: {
                type: "Computed",
                span: { start: 0, end: 0, ctxt: 0 },
                expression: {
                  type: "NumericLiteral",
                  span: { start: 0, end: 0, ctxt: 0 },
                  value: scope.backs.length - 1,
                },
              },
            };
            //scope.funcback.push(`()=>{return ${deparse(nnode.right).slice(0,-1)}}`);
            /*lines.push({
              type: 'AssignmentExpression',
              span: {start:0, end:0, ctxt:0},
              operator: '=',
              left: {
                type: 'Identifier',
                span: {start: 0, end:0, ctxt:0},
                value: `$${scope.resno++}`,
                optional: false
              },
              right: {
                type: 'AwaitExpression',
                span: {start:0,end:0,ctxt:0},//nnode.right.span,
                argument: {
                  type: 'CallExpression',
                  span: {start:0,end:0,ctxt:0},
                  callee: {
                    type: 'Identifier',
                    span: {start:0,end:0,ctxt:0},
                    value: 'server',
                    optional: false,
                  },
                  arguments: [
                    {
                      //spread: {start:0,end:0,ctxt:0},
                      expression: { type:'NumericLiteral', span:{start:0,end:0,ctxt:0}, value:0 },
                    }
                  ],
                  //typeArguments: null
                }
              }
            });*/
          }
          return {
            in: res0.in,
            state: res0.state,
            values: [],
          };
        } // a.b
        else if (node.type == "MemberExpression") {
          const nnode = node as swct.MemberExpression;
          const res = inscope(nnode.object);
          // Collapse state environment (state.window -> window)
          if (res.state && nnode.property.type == "Identifier") {
            const fnode = nnode.property;
            const tnode = node as unknown as Record<string, unknown>;
            for (const key in tnode) {
              if (Object.prototype.hasOwnProperty.call(tnode, key)) {
                delete tnode[key];
              }
            }
            Object.assign(tnode, fnode);
            return { in: true, state: false, values: [] };
          }
          return {
            in: res.in,
            state: false,
            values: [node],
          };
        } // a +|-|... b
        else if (node.type == "BinaryExpression") {
          const res0 = inscope((node as swct.BinaryExpression).left),
            res1 = inscope((node as swct.BinaryExpression).right);
          return {
            in: res0.in && res1.in,
            state: false,
            values: [...res0.values, ...res1.values],
          };
        } // var
        else if (node.type == "Identifier") {
          const nnode = node as swct.Identifier;
          return {
            in: Object.keys(scope.namespace).includes(nnode.value),
            state: scope.state == nnode.value,
            values: [node],
          };
        } // Raw value
        else if (
          ["StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral"]
            .includes(node.type)
        ) return { in: true, state: false, values: [] };
        else {
          console.log(`Unknown type ${node.type}`, node);
          return {
            in: false,
            state: false,
            values: [],
          };
        }
        // var a,b,c
        //if (node.type == 'VariableDeclaration') {
        //  return {
        //    in:(node as swct.VariableDeclaration).declarations.every(x=>inscope(x).in),
        //    values:[]
        //  };
        //}
        // a(b)
        //else if (node.type == 'CallExpression') return inscope((node as swct.CallExpression).callee) && (node as swct.CallExpression).arguments.every(x=>inscope(x.expression));
        // val
        // return
        //else if (node.type == 'ReturnStatement') {
        //  inscope((node as swct.ReturnStatement).argument);
        //  return true; // There cant be a server-sided return to client
        //}
        // var (a=b)
        //else if (node.type == 'VariableDeclarator') {
        //  const nnode = node as swct.VariableDeclarator;
        //  if (nnode.id.type != 'Identifier') throw new Error(`Unknown situation ${node}`)
        //  scope.namespace[nnode.id.value] = nnode.init ? inscope(nnode.init) : true;
        //  return scope.namespace[nnode.id.value] ?? false;
        //}
        // if else
        //else if (node.type == 'IfStatement') {}
      }
      f.body = {
        type: "BlockStatement",
        span: f.span,
        stmts: [],
      } as swct.BlockStatement;
      for (const line of lines) {
        const res = inscope(line);
        if (scope.backs.length && res.in) {
          state.back.push(
            `(...$$)=>[${scope.backs.map((x) => deparse(x)).join(",")}]`,
          );
          f.body.stmts.push(
            swc.parse(
              `const $${state.back.length - 1} = await server(${
                state.back.length - 1
              });`,
              {
                syntax: "ecmascript",
                target: "es2022",
              },
            ).body[0] as swct.Statement,
          );
        }
        scope.backs = [];
        f.body.stmts.push(line);
        //console.log(res);
      }
      //console.log(lines.map(x=>inscope(x)));

      //console.log("\x1b[33mFUNC\x1b[0m", ftmp);
      //console.log("\x1b[33mSCOPE\x1b[0m", scope);
      console.log("\x1b[33mPARSED FUNCTION\x1b[0m", deparse(f));
      console.log(
        "\x1b[33mBACKEND FUNCTIONS\x1b[0m",
        state.back.map((x) => String(x)),
      );

      //console.log(`\x1b[1;32mPARTS\x1b[0;33m\nid\x1b[0m ${String(funcs[funcs.length-1].id)}\n\x1b[33mback\x1b[0m ${String(funcs[funcs.length-1].back)}\n\x1b[33m\x1b[0m ${funcs[funcs.length-1].front}\n\n\x1b[1;32mG\x1b[0m\n`,scope);
      return state.functions.length - 1;
      /*return {
        type: "ExpressionStatement",
        span: f.span,
        expression: f,
      };*/
    }

    let out: number | null = null;

    /** Passes parsed function has modifiable function */
    if (parsed.body[0].type == "FunctionDeclaration") {
      out = modify(parsed.body[0], this);
    } else if (
      parsed.body[0].type == "ExpressionStatement" &&
      parsed.body[0].expression.type == "ArrowFunctionExpression"
    ) out = modify(parsed.body[0].expression, this);

    this.stream_request(0, []);

    return out;
    //console.log(parsed);

    //return this.functions.length - 1; //swc.print(parsed).code;
  }

  update() {
    return eval(`(${this.back[0]})()`);
    //this.back;
  }
  private streaming: string[] = [];
  private stream_request(no: number, args: unknown[]) {
    if (no < 0 || no > this.back.length) {
      throw Error("Invalid backend function ID");
    }
    const code = `(${this.back[no]})(${JSON.stringify(args)})`;
    if (!this.streaming.length && this.stream_promise != null) {
      this.stream_promise(code);
      this.stream_promise = null;
    } else this.streaming.push(code);
  }
  private stream_promise: null | ((val: string) => void) = null;
  stream(): Promise<string> {
    return new Promise((res) => {
      if (this.streaming.length) res(this.streaming.pop()!);
      else this.stream_promise = res;
      setTimeout(res, 9999999999); // Prevents: Top-level await promise never resolved
    });
  }
}
/** Scope handler - used in parsing */
export class Scope {
  constructor(from: Scope | null = null) {
    if (from != null) {
      const keys = Object.keys(from) as (keyof Scope)[];
      for (const key of keys) this.copy(key, from[key]);
    }
  }
  /* ----- Main Properties ----- */
  /** State variable name *(First argument of the main function)* */
  state: string = "";
  /** Namespace backend? *(true:backend, false:frontend, null:undetermined)* */
  namespace: { [name: string]: boolean | null } = {};
  /** Backend dependencies */
  backs: { node: swc_node; args: swc_node[] }[] = [];
  /** Scope is within itself? */
  in: boolean = true;
  /** Scope is currently within state? */
  instate: boolean = false;
  /** Function currently in scope of *(Is always referenced!)* */
  func?: swct.ArrowFunctionExpression;
  /** Number of server sided calls */
  noback: number = 0;
  /** Resulting function call */
  res?: { id: number };
  /** Values used */
  values: {
    /** Node of value */
    node: swc_node;
    /** Is backend dependent? */
    back: boolean;
  }[] = [];

  /* ----- Private Methods ----- */
  /** Copies other scope property to current property */
  private copy<K extends keyof Scope>(key: K, value: Scope[K]) {
    (this as Pick<Scope, K>)[key] =
      typeof value === "object" && value !== null && key != "func"
        ? this.clone(value)
        : value;
  }
  /** Cloning Objects */
  private clone<T>(data: T): T {
    if (data === null || typeof data !== "object") return data;
    if (Array.isArray(data)) return data.map((x) => this.clone(x)) as T;
    const cloned: T = {} as T;
    for (const key in data) cloned[key] = this.clone(data[key]);
    return cloned;
  }
  /** Checks if two parsed scopes are equal */
  static equal<T = swct.Node>(a: T, b: T): boolean {
    if (a == b) return true;
    if (
      typeof a !== "object" || a === null ||
      typeof b !== "object" || b === null
    ) return false;
    const keysA = Object.keys(a) as (keyof T)[],
      keysB = new Set(Object.keys(b));
    if (keysA.length !== keysB.size) return false;
    for (const key of keysA) {
      if (!keysB.has(key as string)) return false;
      const valA = a[key];
      const valB = b[key as keyof T];
      if (!this.equal(valA, valB)) return false;
    }
    return true;
  }
}

/* ----- DALX Classes ----- */
/** Main element class */
export class Dalx {
  /* ----- Element related ----- */
  constructor(
    attr: objstr = {},
    children: unknown[] = [],
  ) {
    this.children = children;
    this.attr = attr;
  }
  /** Attributes of element */
  attr: objstr = {};
  /** Children of Element */
  children: unknown[] = [];

  /* ----- JSX Processing ----- */
  /** JSX Factory */
  static jsx(
    tag: typeof Dalx | keyof JSX.IntrinsicElements,
    attr: { [name: string]: unknown },
    ...children: unknown[]
  ): Dalx {
    if (typeof tag === "string" || typeof tag === "number") {
      return new HTMLElement(String(tag), attr ?? {}, children);
    }
    return new tag(attr, children);
  }
  /** Content of element to be compiled */
  content(_req: Request | null, _parent: Dalx): unknown {
    return this.children;
  }
  /** Compiles the whole element *(Dont Override)*
   * `render(req, replace)`
   */
  async render(
    req: Request | null = null,
    parent: Dalx = this,
  ): Promise<string | Response> {
    let out = "";
    const content = await this.content(req, parent);
    for (const cont of (Array.isArray(content) ? content : [content])) {
      if (typeof cont == "string") out += cont;
      else if (cont instanceof Response) return cont;
      else if (cont instanceof Dalx) {
        const rendered = await cont.render(req, parent);
        if (typeof rendered == "string") out += rendered;
        else return rendered;
      }
    }
    return out;
  }

  /* ----- STATE Processing ----- */
  /** States */
  static states: state_record[] = [];
  /** States functions */
  static state_funcs: string[] = [];
  /** Parses token with state */
  static parse<T extends objstr = objstr, A extends unknown[] = unknown[]>(
    /** Parsing with respect to this State */
    state_id: State<T> | state_record<T, A>,
    /** Node to parse */
    node:
      | embedded_function<T, A>
      | swc_node,
    /** Scope of parsing *(optional)* */
    scope: Scope = new Scope(),
  ): Scope {
    /** State Record found? */
    const [state] = state_id instanceof State
      ? Dalx.states.filter((x) =>
        x.id == state_id
      ) as (state_record<T, A> | undefined)[]
      : [state_id];
    if (state === undefined) throw new Error("State not found");

    /** Parsing a function */
    if (
      typeof node == "function" || node.type == "ArrowFunctionExpression" ||
      node.type == "FunctionDeclaration"
    ) {
      /** Check if already parsed *(saves processing time)* */
      const match = typeof node == "function"
        ? state.funcs.map((x, n) => ({ id: n, val: x })).filter(
          (x) => x.val.id == node,
        )
        : [];
      if (match.length) {
        scope.res = { id: match[0].id };
        return scope;
      }

      /** Partially Unified Function Type */
      const pf: swct.ArrowFunctionExpression | swct.FunctionDeclaration | null =
        typeof node == "function"
          ? [
            swc.parse(String(node), {
              syntax: "ecmascript",
              target: "es2022",
            }).body[0],
          ].map((x) =>
            x.type == "ExpressionStatement" &&
              x.expression.type == "ArrowFunctionExpression"
              ? x.expression
              : x.type == "FunctionDeclaration"
              ? x
              : null
          )[0]
          : node;
      if (pf == null) throw new Error("Cannot process function");

      /** Unified Function Type */
      const f: swct.ArrowFunctionExpression = pf.type == "FunctionDeclaration"
        ? {
          type: "ArrowFunctionExpression",
          span: pf.span,
          params: pf.params.map((x) => x.pat),
          body: pf.body,
          async: pf.async,
          generator: pf.generator,
          typeParameters: pf.typeParameters,
          returnType: pf.returnType,
        } as swct.ArrowFunctionExpression
        : pf;

      /** Output */
      if (typeof node == "function") {
        state.funcs.push({
          id: node as embedded_function<T, A>,
          front: "",
        });
      }

      /** Parse arguments in namespace and scope's state name */
      f.params.map((x) => x.type == "Identifier" ? x.value : null)
        .filter((x) => x != null).forEach((arg, n) => {
          scope.namespace[arg] = false;
          if (!n && !scope.state.length) scope.state = arg;
        });
      f.params.splice(0, 1);

      /** Function commands */
      const lines: (swct.Statement | swct.ModuleItem)[] =
        f.body.type == "BlockStatement" ? f.body.stmts : [{
          type: "ReturnStatement",
          span: f.span,
          argument: f.body,
        } as swct.ReturnStatement];

      /** Processing each lines */
      //const nscope = new Scope(scope);
      //nscope.func = f;
      scope.func = f;
      for (let n = 0; n < lines.length; n++) {
        Dalx.parse<T,A>(state, lines[n], scope);
        // Generating connection between client and server, and server sided code
        if (scope.backs.length) {
          // Insert server request
          lines.splice(
            n,
            0,
            swc.parse(
              `const $${scope
                .noback++} = await server(${Dalx.state_funcs.length})`,
              { syntax: "ecmascript", target: "es2022" },
            ).body[0] as swct.VariableDeclaration,
          );
          //// @ts-ignore This is based on the code above thus is constant

          const args = (((lines[n] as swct.VariableDeclaration).declarations[0]
            .init! as swct.AwaitExpression).argument as swct.CallExpression)
            .arguments;
          args.push(
            ...scope.backs.map((x) => x.args).flat().map((x) => ({
              expression: x,
            } as swct.Argument)),
          );
          n++;
          // Generate Server-sided code
          Dalx.state_funcs.push(
            swc.print({
              type: "Module",
              span: { start: 0, end: 0, ctxt: 0 },
              body: [{
                type: "ExpressionStatement",
                span: { start: 0, end: 0, ctxt: 0 },
                expression: {
                  type: "ArrowFunctionExpression",
                  span: { start: 0, end: 0, ctxt: 0 },
                  params: [{
                    type: "RestElement",
                    span: { start: 0, end: 0, ctxt: 0 },
                    rest: { start: 0, end: 0, ctxt: 0 },
                    argument: {
                      type: "Identifier",
                      span: { start: 0, end: 0, ctxt: 0 },
                      value: "$$",
                      optional: false,
                    },
                  }],
                  body: {
                    type: "BlockStatement",
                    span: { start: 0, end: 0, ctxt: 0 },
                    stmts: [
                      {
                        type: "ReturnStatement",
                        span: { start: 0, end: 0, ctxt: 0 },
                        argument: {
                          type: "ArrayExpression",
                          span: { start: 0, end: 0, ctxt: 0 },
                          elements: scope.backs.map((x) => {
                            const node = x.node;
                            return { expression: node };
                          }) as (swct.ExprOrSpread | undefined)[],
                        },
                      },
                    ],
                  },
                  async: true,
                  generator: false,
                },
              }],
              interpreter: "",
            }).code.slice(3, -2),
          );

          //console.log(scope.backs);
        }
        // Reset scopes
        scope.backs = [];
        scope.instate = false;
        scope.values = [];
      }
      console.log(
        "\x1b[1;32mFRONTEND:\x1b[0m\n" +
          Dalx.deparse(f).split("\n").map((x) => "  " + x).join("\n") +
          "\n\n" +
          "\x1b[1;32mBACKEND:\x1b[0m\n" +
          Dalx.state_funcs.join("\n").split("\n").map((x) => "  " + x).join(
            "\n",
          ),
      );

      return scope;
    }
    /* ----- PARSING TOKENS ----- */
    if (!scope.func) {
      throw new Error("Cannot parse content not inside of function");
    }
    /** Inserts a server request at a node */
    function node_server(node: swc_node, ...args: swc_node[]) {
      // Technically Impossible Error
      if (!scope.func) {
        throw new Error("Function is not defined [This shouldnt happen]");
      }
      // Convert the client-sided variables to arguments: var => $$[n]
      const sargs = scope.values.filter((x) => !x.back).map((x) =>
        structuredClone(x.node)
      );
      for (const arg of args) {
        for (let n = 0; n < sargs.length; n++) {
          if (Scope.equal(sargs[n], arg)) {
            const tnode = arg as unknown as Record<string, unknown>;
            for (const key in tnode) {
              if (Object.prototype.hasOwnProperty.call(tnode, key)) {
                delete tnode[key];
              }
            }
            Object.assign(tnode, {
              type: "MemberExpression",
              span: { start: 0, end: 0, ctxt: 0 },
              object: {
                type: "Identifier",
                span: { start: 0, end: 0, ctxt: 0 },
                value: "$$",
                optional: false,
              },
              property: {
                type: "Computed",
                span: { start: 0, end: 0, ctxt: 0 },
                expression: {
                  type: "NumericLiteral",
                  span: { start: 0, end: 0, ctxt: 0 },
                  value: n,
                },
              },
            });
            break;
          }
        }
      }
      scope.func.async = true;
      scope.backs.push({
        node: structuredClone(node),
        args: sargs,
      });
      const n = node as unknown as Record<string, unknown>;
      for (const key in n) {
        if (Object.prototype.hasOwnProperty.call(n, key)) {
          delete n[key];
        }
      }
      Object.assign(n, {
        type: "MemberExpression",
        span: { start: 0, end: 0, ctxt: 0 },
        object: {
          type: "Identifier",
          span: { start: 0, end: 0, ctxt: 0 },
          value: `$${scope.noback}`,
          optional: false,
        },
        property: {
          type: "Computed",
          span: { start: 0, end: 0, ctxt: 0 },
          expression: {
            type: "NumericLiteral",
            span: { start: 0, end: 0, ctxt: 0 },
            value: scope.backs.length - 1,
          },
        },
      });
    }
    //console.log("\x1b[1;33mSTEP:\x1b[0m", node.type);
    // let|var|const a,b,c,...
    if (node.type == "VariableDeclaration") {
      const nscope = new Scope(scope);
      for (let n = 0; n < node.declarations.length; n++) {
        Dalx.parse(state, node.declarations[n], nscope);
        if (!nscope.in) {
          scope.backs.push({
            node: node.declarations.slice(n, 1)[0],
            args: scope.values.filter((x) => !x.back).map((x) => x.node),
          });
        }
        scope.namespace = { ...scope.namespace, ...nscope.namespace };
        scope.values.push(...nscope.values);
        scope.backs.push(...nscope.backs);
        nscope.in = true;
      }
      //const res = node.declarations.map(x => Dalx.parse(state, x, new Scope(scope)));
    } // let|var|const a
    else if (node.type == "VariableDeclarator") {
      if (node.id.type != "Identifier") {
        throw new Error("Unknown VariableDeclarator");
      }
      if (!node.init) {
        scope.namespace[node.id.value] = null;
      } else {
        const res = Dalx.parse(state, node.init, scope);
        scope.namespace[node.id.value] = !res.in;
      }
    } // Statement
    else if (node.type == "ExpressionStatement") {
      Dalx.parse(state, node.expression, scope);
    } // a = b
    else if (node.type == "AssignmentExpression") {
      const res = [node.left, node.right].map((x) =>
        Dalx.parse(state, x, new Scope(scope))
      );
      // Server's response is assigned to client's record
      if (res[0].in && !res[1].in) {
        node_server(node.right);
        scope.values = [...scope.values, ...res[1].values];
      }
      scope.in = res[0].in;
      scope.backs = [...scope.backs, ...res[0].backs, ...res[1].backs];
      scope.values = [...scope.values, ...res[0].values, ...res[1].values];
    } // a.b
    else if (node.type == "MemberExpression") {
      Dalx.parse(state, node.object, scope);
      // Replace "a" with "a.b" in values
      for (let n = 0; n < scope.values.length; n++) {
        if (scope.values[n].node == node.object) {
          scope.values.splice(n, 1);
        }
      }
      scope.values.push({
        node: node,
        back: !scope.in,
      });
      // Collapse State Environment
      if (scope.instate && node.property.type == "Identifier") {
        const node_prop = node.property;
        const node_temp = node as unknown as objstr;
        for (const key in node_temp) {
          if (Object.prototype.hasOwnProperty.call(node_temp, key)) {
            delete node_temp[key];
          }
        }
        Object.assign(node_temp, node_prop);
        scope.instate = false;
      }
    } // a o b
    else if (node.type == "BinaryExpression") {
      const res = [node.left, node.right].map((x) =>
        Dalx.parse(state, x, new Scope(scope))
      );
      const back = !res[0].in || !res[1].in;
      // Collapse value "a" and "b" to "a o b" if only they are in the same scope
      if (res[0].in == res[1].in) {
        for (let n = 0; n < scope.values.length; n++) {
          if (
            scope.values[n].node == node.left ||
            scope.values[n].node == node.right
          ) {
            scope.values.splice(n, 1);
          }
        }
        scope.values.push({ node, back });
      } else {
        scope.values.push(...res[0].values, ...res[1].values);
      }
      scope.backs.push(...res[0].backs, ...res[1].backs);
      // A server data is processed with client data, turn the whole thing server-sided (for security)
      if (back) node_server(node, res[0].in ? node.left : node.right);
    } // a(b)
    else if (node.type == "CallExpression") {
      //const res = [node.callee, ...node.arguments.map(x=>x.expression)].map(x => Dalx.parse(state, x, new Scope(scope)));
      //scope.namespace = Object.fromEntries([...Object.entries(scope.namespace),...res.map(x=>Object.entries(x.namespace)).flat()]);
      const call = Dalx.parse(state, node.callee, new Scope(scope));
      const client_sided: number[] = [];
      for (let n = 0; n < node.arguments.length; n++) {
        const arg = node.arguments[n];
        const res = Dalx.parse(state, arg.expression, new Scope(scope));
        call.values.push(...res.values);
        call.backs.push(...res.backs);
        if (call.in && !res.in) node_server(arg.expression);
        if (res.in) client_sided.push(n);
      }
      scope.values.push(...call.values);
      scope.backs.push(...call.backs);
      if (!call.in) {
        node_server(
          node,
          ...node.arguments.filter((_, n) => client_sided.includes(n)).map(
            (x) => x.expression,
          ),
        );
      }
    } // var
    else if (node.type == "Identifier") {
      scope.in = Object.keys(scope.namespace).filter((x) =>
        x == node.value
      ).map((x) => scope.namespace[x] != true)[0] ?? false;
      scope.instate = scope.state == node.value;
      if (scope.instate) {
        node.value = "window";
      }
      scope.values.push({
        node: node,
        back: !scope.in,
      });
      return scope;
    } // raw
    else if (
      ["StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral"]
        .includes(node.type)
    ) {
      scope.in = true;
    } // No match
    else {
      console.error(`\x1b[1;31mUnknown type\x1b[0m ${node.type}`, node);
    }

    /** Default return */
    return scope;
  }
  /** Deparses token. TODO! REMOVE THIS BEFORE DEPLOYMENT */
  static deparse(
    node: swct.Expression | (swct.Statement | swct.ModuleItem)[],
  ): string {
    return swc.print({
      type: "Module",
      span: { start: 0, end: 0, ctxt: 0 },
      body: Array.isArray(node) ? node : [{
        type: "ExpressionStatement",
        span: { start: 0, end: 0, ctxt: 0 },
        expression: node,
      }],
      interpreter: "",
    }).code.slice(3, -2);
  }
}
/** HTML Element */
export class HTMLElement extends Dalx {
  constructor(
    tag: string,
    attr: { [name: string]: unknown },
    children: unknown[],
  ) {
    super(attr, children);
    this.tag = tag;
  }
  override content(_req: unknown, parent: App): unknown {
    return [
      `<${
        // Element Tag
        this.tag}${
        // Element Attributes
        (Object.keys(this.attr).map((x) =>
          ` ${x}="${
            typeof this.attr[x] == "function" && parent.state
              ? parent.state.encode(this.attr[x] as embedded_function)
              : String(this.attr[x])
          }"`
        )).join("")}${
        // Element Ending
        this.children.length ? ">" : "/>"}`,
      // Element children
      ...(this.children.length ? [...this.children, `</${this.tag}>`] : []),
    ];
  }
  /** HTML Tag */
  tag: string;
}
/** Route of a HTTP's request and its response */
export class Route extends Dalx {
  constructor(
    attr: {
      /** Path of data to route */
      path: string;
      /** Raw data to route */
      data?: Uint8Array | string;
      /** Mime type of response */
      type?: string;
    },
    children: unknown[],
  ) {
    super(attr, children);
    this.path = attr.path;
    if (attr.data) this.data = attr.data;
    if (attr.type) this.type = attr.type;
  }
  override content(req: Request | null = null): unknown {
    if (req && new URL(req.url).pathname == this.path) {
      return !this.data ? this.children : new Response(this.data, {
        status: 200,
        headers: {
          "Content-Type": contentType(this.path) ?? "text/plain",
          "Content-Length": (typeof this.data == "string"
            ? this.data.length
            : this.data.byteLength).toString(),
        },
      });
    }
    return [];
  }
  /** Path to response */
  path: string;
  /** Data to response */
  data: Uint8Array | string | null = null;
  /** Mime type */
  type: string = "text/html";
}
/** Main App */
export class App<T extends objstr = objstr> extends Dalx {
  constructor(
    attr: {
      /** Name/Title of Application */
      name: string;
      /** Host application to hostname and port */
      host?: string | boolean | null;
      /** State of client's browser */
      state?: State<T>;
      /** Desktop Window by `width,height,x,y` */
      desk?: number[];
      /** Starting function before request */
      start?: (req: Request) => void;
    },
    children: unknown[],
  ) {
    super(attr, children);
    this.name = attr.name;
    if (attr.state) this.state = attr.state;
    if ("auto" in attr) this.host();
    if ("host" in attr) {
      if (typeof attr.host == "string") {
        this.host(
          Number.isNaN(Number(attr.host)) ? attr.host.split(":")[0] : "0.0.0.0",
          !Number.isNaN(Number(attr.host))
            ? Number(attr.host)
            : !Number.isNaN(Number(attr.host.split(":")[1]))
            ? Number(attr.host.split(":")[1])
            : 80,
        );
      } else this.host();
    }
  }
  override content(_req: Request | null = null): unknown {
    return [
      `<!DOCTYPE html><html><head><title>${this.name}</title></head><body>`,
      ...this.children,
      /*...(Object.keys(this.state).length
        ? [
          /*
          // @ts-ignore: JSON Stringify can deal with any type
          `<script>${
            Object.keys(this.state).map((y) =>
              `${y}=${
                typeof this.state[y] == "function"
                  ? String(this.state[y])
                  : JSON.stringify(this.state[y])
              }`
            ).join(",")
          }</script>`,*
        ]
        : []),*/
      `</body></html>`,
    ];
  }
  async host(host: string = "0.0.0.0", port: number = 80) {
    this.server = Deno.serve({ hostname: host, port }, async (req) => {
      const cont = await this.render(req, this);
      if (typeof cont == "string") {
        return new Response(cont, { headers: { "Content-Type": "text/html" } });
      }
      return cont;
    });
    await this.server.finished;
  }
  /** Name of Application */
  name: string;
  /** Server of Application */
  server: Deno.HttpServer | null = null;
  /** State of Application (Client Side) */
  state: State<T> | null = null;
}

/* ----- TESTING ----- */
Deno.test('State function parsing', () => {
  const state = State.new({x:2});
  function server_function(y:number) {
    console.log('Client has no possible way of hacking this');
    console.log('Client provides', y);
  }
  function dual_function(c:typeof state, y:number) {
    // Using both functions
    c.console.log('Hello Client!');
    console.log('Hello Server!');
    // Calling a pure server-side action
    server_function(y);
  }
  Dalx.parse(state, dual_function);
});