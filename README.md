# Dalx (Incomplete)
**Dalx** *(dal-eks)* - Deno-based Application Library eXtension
- `Deno-based` **Platform** - Built exclusively for the Deno runtime, leveraging its native TypeScript support, secure execution model, and modern tooling
- `Application` **Objective** - Its goal is application development either has a web or native app
- `Library` **Type** - Is designed has a library to be imported
- `eXtension` **Future** - If polished then could be built-in the Deno engine to achieve its goal to "Uncomplicate JavaScript"

What makes Dalx unique compared to the alternatives are:
- **Integrated Client/Server Processing** - No need to create seperate instances of code for server and client *(e.g. Hosting/Windows/Automation)*, instead they are automatically seperated through Javascript Parsing *(SWC)* at Runtime
- **Singular Codebase** - No need to use multiple programming languages like HTML,CSS,JS,SQL,etc. when creating applications because Dalx provides built-in native-like features like `Data` class when dealing with databases, and IntrinsicElement to deal with HTML and more custom elements

## Versions
### 0.1.1
- No need to use `{...array}` to apply contents of array inside JSX, now `{array}` will do
  ```tsx
  const txt = [<h1>Hi</h1>, <h2>Hi2</h2>, <h3>Hi3</h3>];
  <App host>
    {txt}
  </App>
  ```
- Restructured Dalx Type Class, when making extended class do:
  ```tsx
  export class Person extends Dalx<{ name:string, age?:number }> {
    /** Initialized function (no need to use contructor) */
    override async init() {
      console.log('Hello', this.attr.name); // Detected has string
    }
    /** Content it generates */
    override content(req:Request|null, parent:Dalx):unknown {
      return <p>Person "{this.attr.name}" is {this.attr.age ? 'unknown' : `${this.attr.age} years old`}</p>
    }
  }
  ```
  Will soon make it so children is type strict also not only attributes
- Removed `addon` attribute and instead to use tailwindcss use `twc` attribute
  - Enabling it:
    ```tsx
    <App host twc>
      <h1>This loses its heading styles</h1>
      <h2>Same with me</h2>
    </App>
    ```
  - Using tailwindcss coding:
    ```tsx
    <App host twc={`
        .search {
          @apply rounded border border-gray-300;
        }
      `}>
      <input class="search" placeholder="With Apply"></input>
      <br/>
      <input placeholder="Without Apply"></input>
    </App>
    ```



## Documentation
- [`Dalx`](~/Dalx.html) - Main element class
  - Element Related
    - `constructor(attr:objstr={}, children:unknown[]=[])` - Initializes Dalx element
    - `attr:objstr={}` - Attributes of element
    - `children:unknown[]=[]` - Children of elements
  - JSX Processing
    - `static jsx()` - JSX Factory
    - `content()` *(overridden)* - Returns the proccessed content
    - `render()` - Renders element to string or response
  - State Processing
    - `static states:state_record[]=[]`
    - `static parse_func()`
- `HTMLElement` - HTML Elements
  - `tag` - HTML Tag
- `Route` - Routes data to server
  - `path` - Path to routed data
  - `data` - Data to provide
  - `type` - Mime type of response *(Automatic)*
- `App` - Main applications
  - `host` - Host application
  - `name` - Name of application
  - `server` - Server
  - `state` - State of clients
- `State` - State handler
- `Scope` - Scope handler
  - `state` - State variable name *(First argument of the main function)*
  - `namespace` - Namespace backend? *(true:backend, false:frontend, null:undetermined)*
