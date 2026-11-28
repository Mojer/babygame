const fs=require("fs"),path=require("path"),sp=path.join(__dirname,"../src/fury"),out=path.join(__dirname,".."),V=path.join(__dirname,"vendor");
const tk=fs.readFileSync(path.join(__dirname,"../src/tk16/index.html"),"utf8");
const style=tk.match(/<style>[\s\S]*?<\/style>/)[0].replace("--accent:#5b6b2e;","--accent:#55562a;")
  .replace("</style>",".sel{font:inherit;font-size:13px;padding:5px 8px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--fg);min-width:0}\n.tools{flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 20px)}\n.tools button{padding:6px 10px;font-size:13px}\n.tools button[aria-pressed=true]{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}\n</style>");
const head=`<title>Fury 雪曼戰車</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
`;
const body=fs.readFileSync(sp+"/fury2-body.html","utf8"), mod=fs.readFileSync(sp+"/fury3-render.js","utf8"), data=fs.readFileSync(sp+"/fury-data.json","utf8");
const imap=`<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
"three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}
</script>
`;
// artifact page: data fetched from the published fury-data.json
fs.writeFileSync(sp+"/index.html",head+style+"\n\n"+body+"\n"+imap+"<script type=\"module\">\n"+mod+"</script>\n");
// offline single file
let classic=mod.replace('import * as THREE from "three";\nimport {OrbitControls} from "three/addons/controls/OrbitControls.js";\n',"(function(){\nconst OrbitControls=THREE.OrbitControls;\n")+"})();\n";
if(/^import /m.test(classic))throw new Error("import left");
const off="<!doctype html>\n<html lang=\"zh-Hant\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n"
 +head+style+"\n"+body+"\n<script type=\"application/json\" id=\"fury-data\">"+data+"</script>\n<script>\n"+fs.readFileSync(V+"/three.min.js","utf8")+"\n</script>\n<script>\n"+fs.readFileSync(V+"/OrbitControls.js","utf8")+"\n</script>\n<script>\n"+classic+"</script>\n</body>\n</html>\n";
fs.writeFileSync(out+"/fury.html",off);
// LDraw file
const D=JSON.parse(data),f=n=>{n=Math.round(n*1000)/1000;return (Object.is(n,-0)?0:n).toString()};
const o=["0 M4A3E8 Sherman Easy Eight \"Fury\" (1:18, motorized)","0 Name: FURY.ldr","0 Author: Claude","0 !LDRAW_ORG Unofficial_Model",""];
for(let s=1;s<=D.steps.length;s++){D.parts.forEach(p=>{if(p.st!==s||!p.R||!p.P)return;o.push(["1",D.colors[p.c].ld,...p.P.map(f),...p.R.map(f),p.id+".dat"].join(" "))});o.push("0 STEP")}
fs.writeFileSync(out+"/FURY.ldr",o.join("\n")+"\n");
console.log("built; offline KB",(off.length/1024).toFixed(0),"ldr lines",o.length);
