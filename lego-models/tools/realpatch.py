import re, sys
import os
S = os.path.dirname(os.path.abspath(__file__)) + "/"
V = S + "../src/"
LIB = open(S + "real-lib.js", encoding="utf-8").read()
START, END = "// ---- real LDraw part meshes + shared lighting ----", "// ---- end real lib ----\n"


def cut(s, a, b):
    i = s.index(a)
    j = s.index(b, i) + len(b)
    return s[:i], s[j:]


def patch(page, data, body_start, body_end, new_body):
    p = V + page
    s = open(p, encoding="utf-8").read()
    s = re.sub(r'<script type="application/json" id="real-data">.*?</script>\n', "", s, flags=re.S)
    s = s.replace('<script type="importmap">', '<script type="application/json" id="real-data">' + open(S + data, encoding="utf-8").read() + "</script>\n<script type=\"importmap\">", 1)
    if START in s:
        a, b = cut(s, START, END)
        s = a + b
    anchor = "const PH=0.4"
    i = s.index(anchor, s.index('<script type="module">'))
    s = s[:i] + LIB + s[i:]
    if body_start in s:
        a, b = cut(s, body_start, body_end)
        s = a + new_body + b
    elif "lookSetup(renderer" not in s:
        raise SystemExit("body marker missing in " + page)
    s = s.replace("const ldr=toLDraw();", "const ldr=realLDraw(toLDraw().split(\"\\n\").slice(0,5));")
    s = s.replace('<span class="mono">${part}</span>', '<span class="mono">${pid(part)}</span>')
    s = s.replace('<td class="mono">${part}</td>', '<td class="mono">${pid(part)}</td>')
    open(p, "w", encoding="utf-8").write(s)
    print("patched", page)


patch("bolt01/index.html", "bolt-real.json",
      "scene.add(new THREE.HemisphereLight(0xffffff,0x8899aa,1.6));",
      "const objs=PARTS.map(p=>{const g=build(p);g.userData.step=p.step;(p.arm?pivots[p.arm].holder:scene).add(g);return g});\n",
      """lookSetup(renderer,scene,10,0);
const pivots={};
["L","R"].forEach(k=>{
  const pv=new THREE.Group(); pv.position.set(k==="L"?-3.5:3.5,PIVOT_Y*PH,0); scene.add(pv);
  const holder=new THREE.Group(); holder.position.copy(pv.position).multiplyScalar(-1); pv.add(holder);
  pivots[k]={pv,holder};
});
const objs=realGroups(p=>p.arm?pivots[p.arm].holder:scene);
""")

patch("tk16/index.html", "tk16-real.json",
      "scene.add(new THREE.HemisphereLight(0xffffff,0x6f7562,1.5));",
      "  (s===10?gunHolder:s>=8?turret:scene).add(grp); steps.push(grp);\n}\n",
      """lookSetup(renderer,scene,46,.29);
const turret=new THREE.Group(); scene.add(turret);
const gunPivot=new THREE.Group(); gunPivot.position.set(0,37.8*PH,16.5); turret.add(gunPivot);
const gunHolder=new THREE.Group(); gunHolder.position.set(0,-37.8*PH,-16.5); gunPivot.add(gunHolder);
const steps=[];
realGroups(p=>p.st===10?gunHolder:p.st>=8?turret:scene).forEach(g=>{steps[g.userData.step-1]=g});
for(let s=0;s<STEPS.length;s++)if(!steps[s]){steps[s]=new THREE.Group();scene.add(steps[s])}
""")
