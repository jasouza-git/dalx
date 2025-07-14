/** # Dalx
 * **Dalx** *(dal-eks)* - Deno-based Application Library eXtension
 * - `Deno-based` **Platform** - Completely designed for the Deno Engine only
 * - `Application` **Objective** - Its goal is application development either has a web or native app
 * - `Library` **Type** - Is designed has a library to be imported
 * - `eXtension` **Future** - If polished then could be built-in the Deno engine to achieve its goal to "Uncomplicate JavaScript"
 * ## Documentation
 * - [`Dalx`](~/Dalx.html) - Main element class
 *   - Element Related
 *     - `constructor(attr:objstr={}, children:unknown[]=[])` - Initializes Dalx element
 *     - `attr:objstr={}` - Attributes of element
 *     - `children:unknown[]=[]` - Children of elements
 *   - JSX Processing
 *     - `static factory()` - JSX Factory
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
export type embedded_function<T extends objstr = objstr> = (
  c: state_type<T>,
) => unknown;
export type state_function<T extends objstr = objstr> = {
  /** To be parsed function for identification *(We dont include inner functions cause they might have similar content but different context)* */
  id: embedded_function<T>;
  front: string;
};
export type state_record<T extends objstr = objstr> = {
  id: State<T>;
  ctx: T;
  funcs: state_function<T>[];
};

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
  private functions: state_function<T>[] = [];
  /** Backend functions */
  private back: string[] = []; //Function[] = []; //((...arg: unknown[]) => unknown[])[] = [];
  /** Creates a new state handler, use this instead of traditional `new` for type handling */
  static new<T extends objstr>(data: T) {
    return Object.assign(new State<T>(data), data) as state_type;
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
      Object.keys(from).map((x) => {
        const val = from[x as keyof Scope] as unknown;
        this[x as keyof Scope] = typeof val == "object"
          ? this.clone(val)
          : val as any;
      });
    }
  }
  /** State variable name *(First argument of the main function)* */
  state: string = "";
  /** Namespace backend? *(true:backend, false:frontend, null:undetermined)* */
  namespace: { [name: string]: boolean | null } = {};
  /** Backend dependencies */
  backs: swct.Expression[] = [];
  /** Resulting function call */
  res?: { id: number };
  /** Cloning Objects */
  private clone<T>(data: T): T {
    if (data === null || typeof data !== "object") return data;
    if (Array.isArray(data)) return data.map(this.clone) as T;
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
    const keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (
        !keysB.includes(key) ||
        !Scope.equal<any>((a as objstr)[key] as any, (b as objstr)[key] as any)
      ) {
        return false;
      }
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
  static factory(
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
  /** Parses token with state */
  static parse<T extends objstr = objstr>(
    /** Parsing with respect to this State */
    state_id: State<T> | state_record<T>,
    /** Node to parse */
    node:
      | embedded_function<T>
      | swct.Declaration
      | swct.Expression
      | swct.Statement,
    /** Scope of parsing *(optional)* */
    scope: Scope = new Scope(),
  ): Scope {
    /** State Record found? */
    const [state] = state_id instanceof State
      ? Dalx.states.filter((x) =>
        x.id == state_id
      ) as (state_record<T> | undefined)[]
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
          id: node,
          front: "",
        });
      }

      /** Parse arguments in namespace and scope's state name */
      f.params.map((x) => x.type == "Identifier" ? x.value : null)
        .filter((x) => x != null).forEach((arg, n) => {
          scope.namespace[arg] = false;
          if (!n && !scope.state.length) scope.state = arg;
        });

      /** Function commands */
      const lines = f.body.type == "BlockStatement" ? f.body.stmts : [{
        type: "ReturnStatement",
        span: f.span,
        argument: f.body,
      } as swct.ReturnStatement];

      /** Processing each lines */
      for (const line of lines) {
        const res = Dalx.parse<T>(state, line, new Scope(scope));
        // TODO! Deal with results
      }

      return scope;
    }
    /** Not parsing a function */
    // Statement
    if (node.type == 'ExpressionStatement') {
      
    }

    /** Default return */
    return scope;
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

/* ----- Special Functions ----- *
export function State_old<T extends objstr>(
  data: T = {} as T,
  backend: boolean = false,
): DOM.Window & T {
  const out = new Proxy(data, {}) as DOM.Window & T;
  if (backend) Dapp.gstates.push(out);
  else Dapp.cstates.push(out);
  return out;
}*/
