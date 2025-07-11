# Dalx (Incomplete)
**Dalx** *(dal-eks)* - Deno-based Application Library eXtension
- `Deno-based` **Platform** - Built exclusively for the Deno runtime, leveraging its native TypeScript support, secure execution model, and modern tooling
- `Application` **Objective** - Its goal is application development either has a web or native app
- `Library` **Type** - Is designed has a library to be imported
- `eXtension` **Future** - If polished then could be built-in the Deno engine to achieve its goal to "Uncomplicate JavaScript"

What makes Dalx unique compared to the alternatives are:
- **Integrated Client/Server Processing** - No need to create seperate instances of code for server and client *(e.g. Hosting/Windows/Automation)*, instead they are automatically seperated through Javascript Parsing *(SWC)* at Runtime
- **Singular Codebase** - No need to use multiple programming languages like HTML,CSS,JS,SQL,etc. when creating applications because Dalx provides built-in native-like features like `Data` class when dealing with databases, and IntrinsicElement to deal with HTML and more custom elements

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