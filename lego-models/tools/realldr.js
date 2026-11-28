const fs=require("fs"),vm=require("vm");
const [page,json,out]=process.argv.slice(2);
const src=fs.readFileSync(page,"utf8").match(/<script id="model">([\s\S]*?)<\/script>/)[1];
const ctx={};vm.createContext(ctx);vm.runInContext(src+";this.STEPS=STEPS;this.COLORS=COLORS;this.toLDraw=toLDraw;",ctx);
const d=JSON.parse(fs.readFileSync(json)),f=n=>{n=Math.round(n*1000)/1000;return (Object.is(n,-0)?0:n).toString()};
const o=ctx.toLDraw().split("\n").slice(0,5);
for(let s=1;s<=ctx.STEPS.length;s++){d.parts.forEach(p=>{if(p.st===s)o.push(["1",ctx.COLORS[p.c].ld,...p.P.map(f),...p.R.map(f),p.id+".dat"].join(" "))});o.push("0 STEP")}
fs.writeFileSync(out,o.join("\n")+"\n");console.log(out,o.length);
