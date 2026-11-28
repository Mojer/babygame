const fs=require("fs"),vm=require("vm"),path=require("path");
const DIR=process.argv[2], OUT=process.argv[3], V=path.join(__dirname,"vendor");
let h=fs.readFileSync(DIR+"/index.html","utf8");

const model=h.match(/<script id="model">([\s\S]*?)<\/script>/)[1];
const r=new Function(model+";return {PARTS,STEPS,ldr:toLDraw()}")();

h=h.replace(/<script type="importmap">[\s\S]*?<\/script>\n/,"");
h=h.replace(/<script type="module">\nimport \* as THREE from "three";\nimport \{OrbitControls\} from "three\/addons\/controls\/OrbitControls.js";\n/,
  "<script>\n(function(){\nconst OrbitControls=THREE.OrbitControls;\n");
h=h.replace(/<\/script>\s*$/,"})();\n</script>\n");
if(/type="module"|importmap|cdn\.jsdelivr/.test(h))throw new Error("leftover module code");
const vend="<script>\n"+fs.readFileSync(V+"/three.min.js","utf8")+"\n</script>\n<script>\n"+fs.readFileSync(V+"/OrbitControls.js","utf8")+"\n</script>\n";
const out="<!doctype html>\n<html lang=\"zh-Hant\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n"
  +h.replace("<script id=\"model\">",vend+"<script id=\"model\">")+"\n</body>\n</html>\n";
[...out.matchAll(/<script(?: id="model")?>([\s\S]*?)<\/script>/g)].forEach(m=>new vm.Script(m[1]));
fs.writeFileSync(OUT,out);

const t={};r.PARTS.forEach(p=>{const k=p.part+" "+p.color;t[k]=(t[k]||0)+1});
console.log("parts",r.PARTS.length,"steps",r.STEPS.length);if(r.PARTS.length<100)console.log(t);
