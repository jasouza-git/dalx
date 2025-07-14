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
import * as swc from "https://raw.githubusercontent.com/jasouza-git/ext_deno_swc/d7d78162d8bce8f330b43e0881cf8b39e926a11d/mod.ts"; //"./lib/swc/mod.ts";
import * as swct from "https://esm.sh/@swc/core@1.2.212/types.d.ts";
import * as wcws from "jsr:@svefro/win-console-window-state";
import { Webview } from "https://raw.githubusercontent.com/jasouza-git/ext_webview_deno/882e3c536ab158a2c90f6be79b65ee3b88e92037/mod.ts"; //"./lib/webview/mod.ts";
export { DOM };

/* ----- TYPES ----- */
/** Record of state by Dalx */
export type state_record<
  T extends objstr = objstr,
> = {
  /* ----- Properties ----- */
  /** State used for Identification */
  id: State<T>;
  /** Context of state */
  ctx: T;
  /** Processed functions inside state */
  // @ts-ignore There can by any types of arugment types
  funcs: state_function<T>[];
  /** Server-sided sub-functions codes */
  server: string[];

  /* ----- For encoding ----- */
  /** Has backend request so setup connection */
  hasback: boolean;
  /** anonymous functions */
  annm_func: string[];
};
/** Embedded Function save state */
export type state_function<
  T extends objstr = objstr,
  // @ts-ignore A function's arguments is not limited to the same type
  A extends any[] = any[],
> = {
  /** To be parsed function for identification *(We dont include inner functions cause they might have similar content but different context)* */
  id: embedded_function<T, A>;
  /** Name in State namespace */
  name: string;
  /** Front end equivelent code */
  front: string;
  /** Number of arguments excluding state argument */
  args: number;
};
/** Embedded function inside Dalx Element through states */
export type embedded_function<
  T extends objstr = objstr,
  A extends unknown[] = unknown[],
> = (
  /** State Instance */
  c: state_type<T>,
  /** Function Arguments */
  ...args: A
) => unknown;
/** Type of a State including its own methods, its additional methods *(through arguments)*, and its built-in methods *(through client window)* */
export type state_type<
  T extends objstr = objstr,
> = T & State<T> & DOM.Window;
/** Scope values */
export type scope_value = {
  /** Node of value *(Cloned)* */
  node: swc_node;
  /** Is backend dependent? undetermined *(null)* are ignored */
  back: boolean;
  /** Referenced Nodes */
  refs: swc_node[];
};
/** Generic Object Representation has `{[key:string]:unknown}` */
export type objstr = Record<string, unknown>;
/** SWC Nodes */
export type swc_node =
  | swct.Declaration
  | swct.Expression
  | swct.Pattern
  | swct.VariableDeclarator
  | swct.ModuleItem
  | swct.Super
  | swct.Import
  | swct.Statement;

/* ----- DATA ----- */
/** Mime and their extensions *(https://github.com/broofa/mime/blob/main/types/standard.ts)* */
const mime: { [key: string]: string[] } = {
  "application/andrew-inset": ["ez"],
  "application/appinstaller": ["appinstaller"],
  "application/applixware": ["aw"],
  "application/appx": ["appx"],
  "application/appxbundle": ["appxbundle"],
  "application/atom+xml": ["atom"],
  "application/atomcat+xml": ["atomcat"],
  "application/atomdeleted+xml": ["atomdeleted"],
  "application/atomsvc+xml": ["atomsvc"],
  "application/atsc-dwd+xml": ["dwd"],
  "application/atsc-held+xml": ["held"],
  "application/atsc-rsat+xml": ["rsat"],
  "application/automationml-aml+xml": ["aml"],
  "application/automationml-amlx+zip": ["amlx"],
  "application/bdoc": ["bdoc"],
  "application/calendar+xml": ["xcs"],
  "application/ccxml+xml": ["ccxml"],
  "application/cdfx+xml": ["cdfx"],
  "application/cdmi-capability": ["cdmia"],
  "application/cdmi-container": ["cdmic"],
  "application/cdmi-domain": ["cdmid"],
  "application/cdmi-object": ["cdmio"],
  "application/cdmi-queue": ["cdmiq"],
  "application/cpl+xml": ["cpl"],
  "application/cu-seeme": ["cu"],
  "application/cwl": ["cwl"],
  "application/dash+xml": ["mpd"],
  "application/dash-patch+xml": ["mpp"],
  "application/davmount+xml": ["davmount"],
  "application/dicom": ["dcm"],
  "application/docbook+xml": ["dbk"],
  "application/dssc+der": ["dssc"],
  "application/dssc+xml": ["xdssc"],
  "application/ecmascript": ["ecma"],
  "application/emma+xml": ["emma"],
  "application/emotionml+xml": ["emotionml"],
  "application/epub+zip": ["epub"],
  "application/exi": ["exi"],
  "application/express": ["exp"],
  "application/fdf": ["fdf"],
  "application/fdt+xml": ["fdt"],
  "application/font-tdpfr": ["pfr"],
  "application/geo+json": ["geojson"],
  "application/gml+xml": ["gml"],
  "application/gpx+xml": ["gpx"],
  "application/gxf": ["gxf"],
  "application/gzip": ["gz"],
  "application/hjson": ["hjson"],
  "application/hyperstudio": ["stk"],
  "application/inkml+xml": ["ink", "inkml"],
  "application/ipfix": ["ipfix"],
  "application/its+xml": ["its"],
  "application/java-archive": ["jar", "war", "ear"],
  "application/java-serialized-object": ["ser"],
  "application/java-vm": ["class"],
  "application/javascript": ["*js"],
  "application/json": ["json", "map"],
  "application/json5": ["json5"],
  "application/jsonml+json": ["jsonml"],
  "application/ld+json": ["jsonld"],
  "application/lgr+xml": ["lgr"],
  "application/lost+xml": ["lostxml"],
  "application/mac-binhex40": ["hqx"],
  "application/mac-compactpro": ["cpt"],
  "application/mads+xml": ["mads"],
  "application/manifest+json": ["webmanifest"],
  "application/marc": ["mrc"],
  "application/marcxml+xml": ["mrcx"],
  "application/mathematica": ["ma", "nb", "mb"],
  "application/mathml+xml": ["mathml"],
  "application/mbox": ["mbox"],
  "application/media-policy-dataset+xml": ["mpf"],
  "application/mediaservercontrol+xml": ["mscml"],
  "application/metalink+xml": ["metalink"],
  "application/metalink4+xml": ["meta4"],
  "application/mets+xml": ["mets"],
  "application/mmt-aei+xml": ["maei"],
  "application/mmt-usd+xml": ["musd"],
  "application/mods+xml": ["mods"],
  "application/mp21": ["m21", "mp21"],
  "application/mp4": ["*mp4", "*mpg4", "mp4s", "m4p"],
  "application/msix": ["msix"],
  "application/msixbundle": ["msixbundle"],
  "application/msword": ["doc", "dot"],
  "application/mxf": ["mxf"],
  "application/n-quads": ["nq"],
  "application/n-triples": ["nt"],
  "application/node": ["cjs"],
  "application/octet-stream": [
    "bin",
    "dms",
    "lrf",
    "mar",
    "so",
    "dist",
    "distz",
    "pkg",
    "bpk",
    "dump",
    "elc",
    "deploy",
    "exe",
    "dll",
    "deb",
    "dmg",
    "iso",
    "img",
    "msi",
    "msp",
    "msm",
    "buffer",
  ],
  "application/oda": ["oda"],
  "application/oebps-package+xml": ["opf"],
  "application/ogg": ["ogx"],
  "application/omdoc+xml": ["omdoc"],
  "application/onenote": [
    "onetoc",
    "onetoc2",
    "onetmp",
    "onepkg",
    "one",
    "onea",
  ],
  "application/oxps": ["oxps"],
  "application/p2p-overlay+xml": ["relo"],
  "application/patch-ops-error+xml": ["xer"],
  "application/pdf": ["pdf"],
  "application/pgp-encrypted": ["pgp"],
  "application/pgp-keys": ["asc"],
  "application/pgp-signature": ["sig", "*asc"],
  "application/pics-rules": ["prf"],
  "application/pkcs10": ["p10"],
  "application/pkcs7-mime": ["p7m", "p7c"],
  "application/pkcs7-signature": ["p7s"],
  "application/pkcs8": ["p8"],
  "application/pkix-attr-cert": ["ac"],
  "application/pkix-cert": ["cer"],
  "application/pkix-crl": ["crl"],
  "application/pkix-pkipath": ["pkipath"],
  "application/pkixcmp": ["pki"],
  "application/pls+xml": ["pls"],
  "application/postscript": ["ai", "eps", "ps"],
  "application/provenance+xml": ["provx"],
  "application/pskc+xml": ["pskcxml"],
  "application/raml+yaml": ["raml"],
  "application/rdf+xml": ["rdf", "owl"],
  "application/reginfo+xml": ["rif"],
  "application/relax-ng-compact-syntax": ["rnc"],
  "application/resource-lists+xml": ["rl"],
  "application/resource-lists-diff+xml": ["rld"],
  "application/rls-services+xml": ["rs"],
  "application/route-apd+xml": ["rapd"],
  "application/route-s-tsid+xml": ["sls"],
  "application/route-usd+xml": ["rusd"],
  "application/rpki-ghostbusters": ["gbr"],
  "application/rpki-manifest": ["mft"],
  "application/rpki-roa": ["roa"],
  "application/rsd+xml": ["rsd"],
  "application/rss+xml": ["rss"],
  "application/rtf": ["rtf"],
  "application/sbml+xml": ["sbml"],
  "application/scvp-cv-request": ["scq"],
  "application/scvp-cv-response": ["scs"],
  "application/scvp-vp-request": ["spq"],
  "application/scvp-vp-response": ["spp"],
  "application/sdp": ["sdp"],
  "application/senml+xml": ["senmlx"],
  "application/sensml+xml": ["sensmlx"],
  "application/set-payment-initiation": ["setpay"],
  "application/set-registration-initiation": ["setreg"],
  "application/shf+xml": ["shf"],
  "application/sieve": ["siv", "sieve"],
  "application/smil+xml": ["smi", "smil"],
  "application/sparql-query": ["rq"],
  "application/sparql-results+xml": ["srx"],
  "application/sql": ["sql"],
  "application/srgs": ["gram"],
  "application/srgs+xml": ["grxml"],
  "application/sru+xml": ["sru"],
  "application/ssdl+xml": ["ssdl"],
  "application/ssml+xml": ["ssml"],
  "application/swid+xml": ["swidtag"],
  "application/tei+xml": ["tei", "teicorpus"],
  "application/thraud+xml": ["tfi"],
  "application/timestamped-data": ["tsd"],
  "application/toml": ["toml"],
  "application/trig": ["trig"],
  "application/ttml+xml": ["ttml"],
  "application/ubjson": ["ubj"],
  "application/urc-ressheet+xml": ["rsheet"],
  "application/urc-targetdesc+xml": ["td"],
  "application/voicexml+xml": ["vxml"],
  "application/wasm": ["wasm"],
  "application/watcherinfo+xml": ["wif"],
  "application/widget": ["wgt"],
  "application/winhlp": ["hlp"],
  "application/wsdl+xml": ["wsdl"],
  "application/wspolicy+xml": ["wspolicy"],
  "application/xaml+xml": ["xaml"],
  "application/xcap-att+xml": ["xav"],
  "application/xcap-caps+xml": ["xca"],
  "application/xcap-diff+xml": ["xdf"],
  "application/xcap-el+xml": ["xel"],
  "application/xcap-ns+xml": ["xns"],
  "application/xenc+xml": ["xenc"],
  "application/xfdf": ["xfdf"],
  "application/xhtml+xml": ["xhtml", "xht"],
  "application/xliff+xml": ["xlf"],
  "application/xml": ["xml", "xsl", "xsd", "rng"],
  "application/xml-dtd": ["dtd"],
  "application/xop+xml": ["xop"],
  "application/xproc+xml": ["xpl"],
  "application/xslt+xml": ["*xsl", "xslt"],
  "application/xspf+xml": ["xspf"],
  "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"],
  "application/yang": ["yang"],
  "application/yin+xml": ["yin"],
  "application/zip": ["zip"],
  "application/zip+dotlottie": ["lottie"],
  "audio/3gpp": ["*3gpp"],
  "audio/aac": ["adts", "aac"],
  "audio/adpcm": ["adp"],
  "audio/amr": ["amr"],
  "audio/basic": ["au", "snd"],
  "audio/midi": ["mid", "midi", "kar", "rmi"],
  "audio/mobile-xmf": ["mxmf"],
  "audio/mp3": ["*mp3"],
  "audio/mp4": ["m4a", "mp4a", "m4b"],
  "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
  "audio/ogg": ["oga", "ogg", "spx", "opus"],
  "audio/s3m": ["s3m"],
  "audio/silk": ["sil"],
  "audio/wav": ["wav"],
  "audio/wave": ["*wav"],
  "audio/webm": ["weba"],
  "audio/xm": ["xm"],
  "font/collection": ["ttc"],
  "font/otf": ["otf"],
  "font/ttf": ["ttf"],
  "font/woff": ["woff"],
  "font/woff2": ["woff2"],
  "image/aces": ["exr"],
  "image/apng": ["apng"],
  "image/avci": ["avci"],
  "image/avcs": ["avcs"],
  "image/avif": ["avif"],
  "image/bmp": ["bmp", "dib"],
  "image/cgm": ["cgm"],
  "image/dicom-rle": ["drle"],
  "image/dpx": ["dpx"],
  "image/emf": ["emf"],
  "image/fits": ["fits"],
  "image/g3fax": ["g3"],
  "image/gif": ["gif"],
  "image/heic": ["heic"],
  "image/heic-sequence": ["heics"],
  "image/heif": ["heif"],
  "image/heif-sequence": ["heifs"],
  "image/hej2k": ["hej2"],
  "image/ief": ["ief"],
  "image/jaii": ["jaii"],
  "image/jais": ["jais"],
  "image/jls": ["jls"],
  "image/jp2": ["jp2", "jpg2"],
  "image/jpeg": ["jpg", "jpeg", "jpe"],
  "image/jph": ["jph"],
  "image/jphc": ["jhc"],
  "image/jpm": ["jpm", "jpgm"],
  "image/jpx": ["jpx", "jpf"],
  "image/jxl": ["jxl"],
  "image/jxr": ["jxr"],
  "image/jxra": ["jxra"],
  "image/jxrs": ["jxrs"],
  "image/jxs": ["jxs"],
  "image/jxsc": ["jxsc"],
  "image/jxsi": ["jxsi"],
  "image/jxss": ["jxss"],
  "image/ktx": ["ktx"],
  "image/ktx2": ["ktx2"],
  "image/pjpeg": ["jfif"],
  "image/png": ["png"],
  "image/sgi": ["sgi"],
  "image/svg+xml": ["svg", "svgz"],
  "image/t38": ["t38"],
  "image/tiff": ["tif", "tiff"],
  "image/tiff-fx": ["tfx"],
  "image/webp": ["webp"],
  "image/wmf": ["wmf"],
  "message/disposition-notification": ["disposition-notification"],
  "message/global": ["u8msg"],
  "message/global-delivery-status": ["u8dsn"],
  "message/global-disposition-notification": ["u8mdn"],
  "message/global-headers": ["u8hdr"],
  "message/rfc822": ["eml", "mime", "mht", "mhtml"],
  "model/3mf": ["3mf"],
  "model/gltf+json": ["gltf"],
  "model/gltf-binary": ["glb"],
  "model/iges": ["igs", "iges"],
  "model/jt": ["jt"],
  "model/mesh": ["msh", "mesh", "silo"],
  "model/mtl": ["mtl"],
  "model/obj": ["obj"],
  "model/prc": ["prc"],
  "model/step": ["step", "stp", "stpnc", "p21", "210"],
  "model/step+xml": ["stpx"],
  "model/step+zip": ["stpz"],
  "model/step-xml+zip": ["stpxz"],
  "model/stl": ["stl"],
  "model/u3d": ["u3d"],
  "model/vrml": ["wrl", "vrml"],
  "model/x3d+binary": ["*x3db", "x3dbz"],
  "model/x3d+fastinfoset": ["x3db"],
  "model/x3d+vrml": ["*x3dv", "x3dvz"],
  "model/x3d+xml": ["x3d", "x3dz"],
  "model/x3d-vrml": ["x3dv"],
  "text/cache-manifest": ["appcache", "manifest"],
  "text/calendar": ["ics", "ifb"],
  "text/coffeescript": ["coffee", "litcoffee"],
  "text/css": ["css"],
  "text/csv": ["csv"],
  "text/html": ["html", "htm", "shtml"],
  "text/jade": ["jade"],
  "text/javascript": ["js", "mjs"],
  "text/jsx": ["jsx"],
  "text/less": ["less"],
  "text/markdown": ["md", "markdown"],
  "text/mathml": ["mml"],
  "text/mdx": ["mdx"],
  "text/n3": ["n3"],
  "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"],
  "text/richtext": ["rtx"],
  "text/rtf": ["*rtf"],
  "text/sgml": ["sgml", "sgm"],
  "text/shex": ["shex"],
  "text/slim": ["slim", "slm"],
  "text/spdx": ["spdx"],
  "text/stylus": ["stylus", "styl"],
  "text/tab-separated-values": ["tsv"],
  "text/troff": ["t", "tr", "roff", "man", "me", "ms"],
  "text/turtle": ["ttl"],
  "text/uri-list": ["uri", "uris", "urls"],
  "text/vcard": ["vcard"],
  "text/vtt": ["vtt"],
  "text/wgsl": ["wgsl"],
  "text/xml": ["*xml"],
  "text/yaml": ["yaml", "yml"],
  "video/3gpp": ["3gp", "3gpp"],
  "video/3gpp2": ["3g2"],
  "video/h261": ["h261"],
  "video/h263": ["h263"],
  "video/h264": ["h264"],
  "video/iso.segment": ["m4s"],
  "video/jpeg": ["jpgv"],
  "video/jpm": ["*jpm", "*jpgm"],
  "video/mj2": ["mj2", "mjp2"],
  "video/mp2t": ["ts", "m2t", "m2ts", "mts"],
  "video/mp4": ["mp4", "mp4v", "mpg4"],
  "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
  "video/ogg": ["ogv"],
  "video/quicktime": ["qt", "mov"],
  "video/webm": ["webm"],
};
Object.freeze(mime);
export default mime;

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
/** ShortCuts */
export class SC {
  /** Checks if two data are equal */
  static equal<T>(a: T, b: T): boolean {
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
  /** Checks if one ore more data are equal */
  static equals<T>(a: T, ...bs: T[]): boolean {
    for (const b of bs) if (SC.equal(a, b)) return true;
    return false;
  }
  /** Pushes children into array but only the uniques */
  static unique<T>(des: T[], ...args: T[][]) {
    for (const arg of args) {
      for (const val of arg) {
        // Check if argument value is unique compared to destination
        let pass = true;
        for (const org of des) {
          if (SC.equal(org, val)) {
            pass = false;
            break;
          }
        }
        if (!pass) continue;
        // Add to destination
        des.push(val);
      }
    }
  }
  /** Pushes children into array but only the uniques including reference */
  static unique_ref<T>(des: T[], ...args: T[][]) {
    for (const arg of args) {
      for (const val of arg) {
        // Check if argument value is unique compared to destination
        let pass = true;
        for (const org of des) {
          if (org == val) {
            pass = false;
            break;
          }
        }
        if (!pass) continue;
        // Add to destination
        des.push(val);
      }
    }
  }
  /** Replaces object's content without changing reference */
  static replace(dest: object, from: object) {
    const tmp = dest as unknown as objstr;
    for (const key in tmp) {
      if (Object.prototype.hasOwnProperty.call(tmp, key)) {
        delete tmp[key];
      }
    }
    Object.assign(tmp, from);
    return tmp;
  }
  /** Generates Server-side's client reference: (...$$) => f($$[index]) */
  static swc_clientrefer(index: number): swct.MemberExpression {
    return {
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
          value: index,
        },
      },
    };
  }
  /** Generates Client-side's server reference: $call[index] */
  static swc_serverrefer(call: number, index: number): swct.MemberExpression {
    return {
      type: "MemberExpression",
      span: { start: 0, end: 0, ctxt: 0 },
      object: {
        type: "Identifier",
        span: { start: 0, end: 0, ctxt: 0 },
        value: `$${call}`,
        optional: false,
      },
      property: {
        type: "Computed",
        span: { start: 0, end: 0, ctxt: 0 },
        expression: {
          type: "NumericLiteral",
          span: { start: 0, end: 0, ctxt: 0 },
          value: index,
        },
      },
    };
  }
  /** Generates Client-side's server call: const $no = await $$$(id, ...args) */
  static swc_servercall(
    no: number,
    id: number,
    args: swct.Argument[],
  ): swct.VariableDeclaration { // TODO, no parse
    const line = swc.parse(
      `const $${no} = await $$$(${id})`,
      { syntax: "ecmascript", target: "es2022" },
    ).body[0] as swct.VariableDeclaration;
    ((line.declarations[0]
      .init! as swct.AwaitExpression).argument as swct.CallExpression)
      .arguments.push(...args);
    return line;
  }
  /** Generates Server-side code *(Client-side doesnt have an equivelent cause provided funciton is by default client-side)* */
  static swc_server(args: swct.ExprOrSpread[]): string {
    return swc.print({
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
                  elements: args,
                },
              },
            ],
          },
          async: true,
          generator: false,
        },
      }],
      interpreter: "",
    }).code.slice(3, -2);
  }
}
/** State handler
 * - **Client sided state** *(Isolated)* - Represents the data located in the client alone
 *   ```ts
 *   const client = State.new({x:2});
 *   function action(c:typeof client) {
 *     c.x = 3; // Only clients that run `action` will have x=3
 *   }
 *   ```
 * - **Server sided state** *(Shared)* - Represents the data that can be shared between clients through the server
 *   ```ts
 *   const client = State.new({x:2});
 *   function action() {
 *     client.x = 3; // Every client will have x=3 if `action` is runned once anywhere
 *   }
 *   ```
 */
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
      server: [],
      hasback: false,
      annm_func: [] as string[],
    } as state_record<T> as state_record);
    return out;
  }
  /** Default/Starting state context for client side state */
  private context: T;
  /** Parsed functions */
  private functions: state_function<T>[] = [];
  /** Creates a new state handler, use this instead of traditional `new` for type handling */
  static new<T extends objstr>(data: T = {} as T) {
    return Object.assign(new State<T>(data), data) as state_type<T>;
  }
  /** Gets state record from Dalx State Records */
  static get<T extends objstr>(
    state_id: State<T> | state_record<T>,
  ): state_record<T> {
    if (!(state_id instanceof State)) return state_id;
    const state =
      (Dalx.states.filter((x) =>
        x.id == state_id
      ) as (state_record<T> | undefined)[])[0];
    if (state === undefined) throw new Error("State not found");
    return state;
  }
}
/** Scope handler
 * > To be only used to parse function like spliting a dual-sided function into client/server sided functions
 */
export class Scope {
  constructor(from: Scope | null = null, init: boolean = false) {
    if (from != null) {
      const keys = Object.keys(from) as (keyof Scope)[];
      for (const key of keys) this.copy(key, from[key]);
    }
    if (init) {
      this.values = [];
      this.backs = [];
    }
  }
  /* ----- Main Properties ----- */
  /** Function currently in scope of *(Is always referenced not cloned!)* */
  func?: swct.ArrowFunctionExpression;
  /** Namespace backend?
   * - `true` - yes and is backend
   * - `false` - no and is frontend
   * - `null` - no but undetermined so possibly frontend/backend
   */
  namespace: { [name: string]: boolean | null } = {};
  /** Scope is within itself? */
  in: boolean | null = null;
  /** Scope is currently within state? */
  //instate: boolean = false;
  /** State variable name *(First argument of the main function)* */
  state: string = "";
  /** Values used */
  values: scope_value[] = [];
  /** Number of server sided calls */
  noback: number = 0;
  /** Backend dependencies *(Referenced)* */
  backs: swc_node[] = [];
  /** Resulting function call `(state.functions[id].front)` */
  res?: string;

  /* ----- Methods ----- */
  /** Copies other scope property to current property */
  private copy<K extends keyof Scope>(key: K, value: Scope[K]) {
    (this as Pick<Scope, K>)[key] =
      typeof value === "object" && value !== null && key != "func"
        ? structuredClone(value)
        : value;
  }
  /** Inserts new values to a scope's value while elliminating duplicating and recording references */
  insert(values: scope_value[] | swc_node, back: boolean = false) {
    if (!Array.isArray(values)) {
      values = [{
        node: structuredClone(values),
        back: back,
        refs: [values],
      } as scope_value];
    }
    for (const value of values) {
      let pass = false;
      /** Insert to pre-existing values */
      for (const pvalue of this.values) {
        if (SC.equal(value.node, pvalue.node)) {
          SC.unique(value.refs, pvalue.refs);
          pass = true;
          break;
        }
      }
      /** Insert has its own new entry */
      if (!pass) this.values.push(value);
    }
  }
  /** Replaces an instance of a value with new value */
  replace(valA: swc_node, valB: swc_node) {
    const xvalA =
      Object.entries(this.values).filter((x) => x[1].refs.includes(valA))[0] ??
        null;
    if (xvalA != null) {
      /** Remove valA */
      const back = xvalA[1].back;
      if (xvalA[1].refs.length == 1) {
        this.values.splice(Number(xvalA[0]), 1);
      } else {
        xvalA[1].refs.splice(xvalA[1].refs.indexOf(valA), 1);
      }

      const xvalB = Object.entries(this.values).filter((x) =>
        SC.equal(x[1].node, valB)
      )[0] ?? null;

      /** Insert valB */
      if (xvalB != null) {
        SC.unique_ref(xvalB[1].refs, [valB]);
      } else {
        this.insert(valB, back);
      }
    }
  }
  /** Inserts a new backend dependencies reference */
  backref(node: swc_node) {
    SC.unique_ref(this.backs, [node]);
  }
  /** Applys the unique backs and values */
  apply(...scopes: Scope[]) {
    SC.unique_ref(this.backs, ...scopes.map((x) => x.backs));
    this.insert(scopes.map((x) => x.values).flat());
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

  /* ----- State Processing ----- */
  /** All states */
  static states: state_record[] = [];
  /** States functions */
  //static state_funcs: string[] = [];
  /** Parses token with state */
  static parse<T extends objstr = objstr, A extends unknown[] = unknown[]>(
    /** Parsing with respect to this State */
    state_id: State<T> | state_record<T>,
    /** Node to parse */
    node:
      | embedded_function<T, A>
      | swc_node,
    /** Scope of parsing *(optional)* */
    scope: Scope = new Scope(),
  ): Scope {
    /** State Record founded */
    const state = State.get(state_id);

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
        scope.res = match[0].val.front;
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
      scope.func = f;

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

      /** Generate backend (server-sided code) */
      const gen_back = (
        /** Starting line Number where server-side starts (Line request will be inserted) */
        sn: number,
      ) => {
        f.async = true;
        state.hasback = true;
        /** Arugments of new function */
        const args = scope.values.filter((x) => !x.back);
        /** Replaces all client values with client-sided call */
        args.forEach((x, n) => {
          x.refs.forEach((y) => SC.replace(y, SC.swc_clientrefer(n)));
        });
        /** Duplicate of backend cause the current back will be its client-side equivelent */
        const backs = structuredClone(scope.backs);
        /** Replace all server dependencies with server-sided call */
        scope.backs.map((x, n) =>
          SC.replace(x, SC.swc_serverrefer(scope.noback, n))
        );
        /** Insert server call */
        lines.splice(
          sn,
          0,
          SC.swc_servercall(
            scope.noback++,
            state.server.length,
            args.map((x) => ({ expression: x.node } as swct.Argument)),
          ),
        );
        /** Generate Server-sided code */
        state.server.push(
          SC.swc_server(
            backs.map((x) => ({ expression: x } as swct.ExprOrSpread)),
          ),
        );
        /** Reset scope backend tracking */
        scope.backs = [];
        scope.values = [];
        //scope.instate = false;
      };

      /** Starting line of backend insert */
      let sno = -1;
      /** Iterate each lines */
      for (let n = 0; n < lines.length; n++) {
        /** Current line, also aids type recognition */
        const line = lines[n];
        /** Parse line */
        Dalx.parse(state, line, scope);
        /** Check if server-side started */
        if (sno == -1 && scope.backs.length) sno = n;
        /** Check if server-side endded */
        if (
          sno != -1 &&
          (!scope.backs.length || scope.in == true || n + 1 == lines.length)
        ) {
          gen_back(sno);
          n++;
          sno = -1;
        }
        /** Delete line if not used *(Just references server response with no use)* */
        if (
          line.type == "ExpressionStatement" &&
          line.expression.type == "MemberExpression" &&
          line.expression.object.type == "Identifier" &&
          /^\$\d+$/.test(line.expression.object.value)
        ) {
          lines.splice(n, 1);
          n--;
        }
        /** Clear values used */
        if (!scope.backs.length) scope.values = [];
        /** Just disable `instate` if on */
        //scope.instate = false;
      }

      /** Output Code */
      const code = Dalx.deparse(f).split("\n").map((x) => x.trim()).join("");
      scope.res = code;
      /** Insert function into parsed state functions */
      if (typeof node == "function") {
        state.funcs.push({
          id: node as embedded_function<T, A>,
          name: Object.keys(state.ctx).filter((x) => state.ctx[x] == node)[0] ??
            "",
          front: code,
          args: f.params.length,
        });
      }
      /** TODO! Remove, cause this is only for debugging *
      console.log(
        "\x1b[1;32mFRONTEND:\x1b[0m\n" +
          Dalx.deparse(f).split("\n").map((x) => "  " + x).join("\n") +
          "\n\n" +
          "\x1b[1;32mBACKEND:\x1b[0m\n" +
          state.server.join("\n").split("\n").map((x) => "  " + x).join(
            "\n",
          ),
      );//*/
      return scope;
    }
    /* ----- PARSING TOKENS ----- */
    if (!scope.func) {
      throw new Error("Cannot parse content not inside of function");
    }
    /** Replaces node with a server request/reference */
    // function node_server(node: swc_node) {
    //   /** Technically Impossible Error */
    //   if (!scope.func) {
    //     throw new Error("Function is not defined [This shouldnt happen]");
    //   }
    //   /** Maybe make server-sided function async. TODO! Recheck if still logical */
    //   scope.func.async = true;
    //   /** Copy this node to backend dependencies */
    //   scope.backs.push(node);
    //   /** Replace this node with a call to server-sided reference *(NVM, also at function creation)* */
    //   //SC.replace(node, SC.swc_servercall(scope.noback, scope.backs.length-1));
    // }
    //console.log("\x1b[1;33mSTEP:\x1b[0m", node.type);
    // let|var|const a,b,c,...
    if (node.type == "VariableDeclaration") {
      for (let n = 0; n < node.declarations.length; n++) {
        Dalx.parse(state, node.declarations[n], scope);
        if (scope.in == false) {
          scope.backref(node.declarations.slice(n, 1)[0]);
        }
        scope.in = true;
      }
    } // let|var|const a
    else if (node.type == "VariableDeclarator") {
      if (node.id.type != "Identifier") {
        throw new Error("Unknown VariableDeclarator");
      }
      if (!node.init) {
        scope.namespace[node.id.value] = null;
      } else {
        Dalx.parse(state, node.init, scope);
        scope.namespace[node.id.value] = !scope.in;
      }
    } // Statement
    else if (node.type == "ExpressionStatement") {
      Dalx.parse(state, node.expression, scope);
    } // a ? b : c
    else if (node.type == "ConditionalExpression") {
      const res = [node.test, node.consequent, node.alternate].map((x) =>
        Dalx.parse(state, x, new Scope(scope, true))
      );
      scope.in = res.every((x) => x.in != false);
      scope.apply(...res);
    } // Return data
    else if (node.type == "ReturnStatement") {
      Dalx.parse(state, node.argument, scope);
      scope.in = true; // Cannot return to server cause function is client-sided
    } // a = b
    else if (node.type == "AssignmentExpression") {
      const res = [node.left, node.right].map((x) =>
        Dalx.parse(state, x, new Scope(scope, true))
      );
      // Push backend dependent values to stack
      if (res[0].in != false && res[1].in == false) scope.backref(node.right);
      else if (res[0].in == false) scope.backref(node);
      // Set scope
      scope.in = res[0].in;
      scope.apply(res[1]); // Cant assign value to another value thus only right-hand can be replaced with a value
    } // a.b
    else if (node.type == "MemberExpression") {
      Dalx.parse(state, node.object, scope);
      // Collapse State Environment
      if (
        scope.in && node.object.type == "Identifier" &&
        node.object.value == "window" && node.property.type == "Identifier"
      ) {
        scope.replace(node.object, node.property);
        SC.replace(node, node.property);
      } // Replace "a" with "a.b" in values
      else scope.replace(node.object, node);
    } // a o b
    else if (node.type == "BinaryExpression") {
      const res = [node.left, node.right].map((x) =>
        Dalx.parse(state, x, new Scope(scope, true))
      );
      // Collapse value "a" and "b" to "a o b" if only they are in the same scope
      if (res[0].in == null || res[1].in == null || res[0].in == res[1].in) {
        scope.replace(node.left, node);
        scope.replace(node.right, node);
      }
      // Set scope
      scope.in = res[0].in == null
        ? res[1].in
        : res[1].in == null
        ? res[0].in
        : res[0].in && res[1].in;
      scope.apply(...res);
    } // a(b)
    else if (node.type == "CallExpression") {
      const call = Dalx.parse(state, node.callee, new Scope(scope));
      for (let n = 0; n < node.arguments.length; n++) {
        const arg = node.arguments[n];
        const res = Dalx.parse(state, arg.expression, new Scope(scope, true));
        // Client calling with server values (has for vise-versa, thats after iteration)
        if (call.in && res.in == false) scope.backref(arg.expression);
        call.apply(res);
      }
      scope.in = call.in;
      scope.values = call.values;
      scope.backs = call.backs;
      if (scope.in == false) scope.backref(node);
    } // var
    else if (node.type == "Identifier") {
      /** Shared identifiers between server and client side */
      const shared = [
        "Number",
        "String",
        "Boolean",
        "Object",
        "Function",
        "Math",
      ];
      scope.in = shared.includes(node.value)
        ? null
        : (Object.keys(scope.namespace).filter((x) => x == node.value).map((
          x,
        ) => scope.namespace[x] == null ? null : !scope.namespace[x])[0] ??
          false);
      if (scope.state == node.value) {
        node.value = "window";
      }
      if (!shared.includes(node.value)) scope.insert(node, !scope.in);
      return scope;
    } // raw
    else if (
      ["StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral"]
        .includes(node.type)
    ) {
      scope.in = null;
    } // No match
    else {
      console.error(`\x1b[1;31mUnknown type\x1b[0m ${node.type}`, node);
    }

    /** Default return */
    return scope;
  }
  /** Initialized code for client state */
  static state_code<T extends objstr = objstr, A extends unknown[] = unknown[]>(
    state: state_record<T>,
  ): string {
    return Object.keys(state.ctx).length
      ? `let ${
        Object.keys(state.ctx).map((x) =>
          `${x}=${
            typeof state.ctx[x] == "function"
              ? (Dalx.parse(state, state.ctx[x] as embedded_function<T, A>)
                .res ?? "()=>console.error('Unknown Function')")
              : JSON.stringify(state.ctx[x])
          }`
        ).join(",")
      };`
      : "";
  }
  /** Returns either a call or declaration of a function with respect to a scope */
  static state_function<
    T extends objstr = objstr,
    A extends unknown[] = unknown[],
  >(state: state_record<T>, func: embedded_function<T, A>): string {
    // Find function in parsed functions
    let res = state.funcs.filter((x) => x.id == func);
    // Find function in main scope(scp)
    const scp = Object.keys(state.ctx).filter((x) => state.ctx[x] == func);
    // If in scope
    if (scp.length) {
      if (!res.length) {
        Dalx.parse(state, func);
        res = state.funcs.filter((x) => x.id == func);
      }
      if (res.length) {
        return `${res[0].name}(${res[0].args ? "...arguments" : ""})`;
      }
      throw new Error("Failed to parse function");
    }
    // Not in scope
    if (!res.length) {
      state.annm_func.push(
        Dalx.parse(state, func as embedded_function<T, A>).res ??
          "()=>console.error('Unknown Function')",
      );
      res = state.funcs.filter((x) => x.id == func);
      if (!res.length) throw new Error("Failed to parse function");
      res[0].name = `$$[${state.annm_func.length - 1}]`;
    }
    return `${res[0].name}()`;
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
  static exit() {
    Dalx.active = false;
    Dalx.run_stack.request("");
    Deno.exit(0);
  }
  static active: boolean = true;
  /** Main run - Allows to pass scope to modified function */
  static async run(loop: (code: string) => unknown[]) {
    while (this.active) {
      const code = await new Promise<string>((res) => {
        /** Gets the first in stack */
        if (Dalx.run_stack.codes.length) res(Dalx.run_stack.codes.shift()!);
        /** Waits it's turn */
        else Dalx.run_stack.promise = res;
        /** Prevents: Top-level await promise never resolved */
        setTimeout(res, 99999999999);
      });
      const res: unknown[] = loop(code);
      if (Dalx.run_stack.response != null) Dalx.run_stack.response(res);
      // console.log(res);
    }
  }
  /** Running stacks */
  static run_stack = {
    codes: [] as string[],
    promise: null as ((code: string) => void) | null,
    response: null as ((arg: unknown[]) => void) | null,
    request: function (code: string): Promise<unknown[]> {
      return new Promise((res) => {
        this.response = res;
        if (!this.codes.length && this.promise != null) {
          this.promise(code);
          this.promise = null;
        } else this.codes.push(code);
      });
    },
  };
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
            typeof this.attr[x] != "function" || !parent.state
              ? String(this.attr[x])
              : Dalx.state_function(
                parent.state,
                this.attr[x] as embedded_function,
              )
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
      let type = "application/octet-stream";
      const ext = this.path.slice(this.path.lastIndexOf(".") + 1).toLowerCase();
      for (const key in mime) {
        if (mime[key].includes(ext)) {
          type = key;
          break;
        }
      }
      return !this.data ? this.children : new Response(this.data, {
        status: 200,
        headers: {
          "Content-Type": type,
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
export class App<T extends objstr = objstr, A extends unknown[] = unknown[]>
  extends Dalx {
  constructor(
    attr: {
      /** Name/Title of Application */
      name?: string;
      /** Host application to hostname and port */
      host?: string | boolean | null;
      /** State of client's browser */
      state?: State<T>;
      /** Desktop Window by `width,height,x,y` */
      desk?: number[] | boolean;
      /** Starting function before request */
      start?: (req: Request) => void;
    },
    children: unknown[],
  ) {
    super(attr, children);
    this.name = attr.name ?? "Untitled";

    const arg_state = attr.state ? attr.state : new State();
    const state = arg_state instanceof State
      ? (Dalx.states.filter((x) =>
        x.id == arg_state
      ) as (state_record<T> | undefined)[])[0]
      : arg_state;
    if (state === undefined) throw new Error("State not found");
    this.state = state;

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
    if ("desk" in attr) {
      this.desk();
    }
  }
  override content(_req: Request | null = null): unknown {
    const code = this.state != null ? Dalx.state_code(this.state) : "";
    return [
      `<!DOCTYPE html><html><head><title>${this.name}</title></head><body>`,
      ...this.children,
      ...((this.state != null
        ? [
          "<script>",
          this.state.annm_func.length
            ? `const $$=[${this.state.annm_func.join(",")}];`
            : "",
          this.state.hasback
            ? "const $$$=async (...args)=>{const res=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});if(!res.ok)throw new Error(`Server error: ${res.status}`);return await res.json()};"
            : "",
          code,
          "</script>",
        ]
        : []) as string[]),
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
      if (
        req.method == "POST" && new URL(req.url).pathname == "/api" &&
        this.state
      ) {
        const body = await req.json() as [number, ...unknown[]];
        if (
          body.length < 0 && typeof body[0] != "number" || body[0] < 0 ||
          body[0] >= this.state.server.length
        ) {
          return new Response("[]", {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const res = await Dalx.run_stack.request(
          `(${this.state.server[body[0]]})(${
            JSON.stringify(body.slice(1)).slice(1, -1)
          })`,
        );
        return new Response(JSON.stringify(res), {
          headers: { "Content-Type": "application/json" },
        });
      }
      const cont = await this.render(req, this);
      if (typeof cont == "string") {
        return new Response(cont, { headers: { "Content-Type": "text/html" } });
      }
      return cont;
    });
    await this.server.finished;
  }
  async desk() {
    /** Fix this rendering problem! */
    await this.render(null, this);

    /* Set a unique console title and then find it to hide (SW_HIDE = 0) */
    await wcws.setCurrentConsoleWindowTitleIncludingDelay("DenoWebviewApp");
    wcws.findNamedConsoleWindowAndSetWindowState("DenoWebviewApp", 0);

    /* Create window */
    const view = new Webview();
    view.title = this.name;
    const cont = await this.render(null, this) as string;
    view.navigate(`data:text/html,${encodeURIComponent(cont)}`);
    await view.run();
    Dalx.exit();
  }
  /** Name of Application */
  name: string;
  /** Server of Application */
  server: Deno.HttpServer | null = null;
  /** State of Application (Client Side) */
  state: state_record<T> | null = null;
}

/* ----- TESTING ----- */
Deno.test("State function parsing", () => {
  const state = State.new({ x: 2 });
  function server_function(y: number) {
    console.log("Client has no possible way of hacking this");
    console.log("Client provides", y);
  }
  function dual_function(c: typeof state, y: number) {
    // Using both functions
    c.console.log("Hello Client!");
    console.log("Hello Server!");
    // Calling a pure server-side action
    server_function(y);
  }
  Dalx.parse(state, dual_function);
});
