import re,sys,os
os.chdir(sys.argv[1])
models=[("fury","🛡️ Fury 雪曼","1:18"),("tk16","🚜 TK-16 戰車","1:16"),("bolt01","🤖 BOLT-01","機器人")]
css='''<style id="lego-nav-css">
#lego-nav{display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 16px 10px;background:#1b1e29;border-bottom:1px solid rgba(255,255,255,.1);font-family:"Huninn","PingFang TC","Noto Sans TC",system-ui,sans-serif;position:sticky;top:0;z-index:50}
#lego-nav .ln-back{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:999px;background:#11131a;color:#f0f2f8;text-decoration:none;font-size:22px;line-height:1}
#lego-nav .ln-title{color:#f0f2f8;font-size:16px;white-space:nowrap}
#lego-nav .ln-tabs{display:flex;gap:8px;margin-left:auto;overflow-x:auto;scrollbar-width:none}
#lego-nav .ln-tabs::-webkit-scrollbar{display:none}
#lego-nav .ln-tabs a{flex:none;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:#11131a;color:#f0f2f8;text-decoration:none;font-size:15px}
#lego-nav .ln-tabs a small{color:#a2a9bf;font-size:12px}
#lego-nav .ln-tabs a[aria-current="page"]{background:#ff7757;border-color:transparent;color:#fff}
#lego-nav .ln-tabs a[aria-current="page"] small{color:#fff;opacity:.85}
@media (max-width:560px){#lego-nav{flex-wrap:wrap}#lego-nav .ln-tabs{margin-left:0;width:100%;gap:6px}#lego-nav .ln-tabs a{padding:8px 11px;font-size:14px}#lego-nav .ln-tabs a small{display:none}}
</style>'''
CUR=' aria-current="page"'
for mid,_,_ in models:
    p=mid+".html"; s=open(p,encoding="utf-8").read()
    s=re.sub(r'<style id="lego-nav-css">.*?</style>\n?','',s,flags=re.S)
    s=re.sub(r'<nav id="lego-nav".*?</nav>\n?','',s,flags=re.S)
    tabs="".join('<a href="%s.html"%s>%s <small>%s</small></a>'%(m,CUR if m==mid else "",n,sm) for m,n,sm in models)
    nav='<nav id="lego-nav" aria-label="切換模型"><a class="ln-back" href="../" aria-label="回遊戲選單">‹</a><span class="ln-title">LEGO 模型工坊</span><div class="ln-tabs">%s</div></nav>'%tabs
    s=s.replace("</head>",css+"\n</head>",1).replace("<body>","<body>\n"+nav,1)
    open(p,"w",encoding="utf-8").write(s)
open("index.html","w",encoding="utf-8").write('''<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><title>LEGO 模型工坊</title>
<script>var h=location.hash.slice(1);location.replace(({tk16:1,bolt01:1})[h]?h+".html":"fury.html");</script>
<meta http-equiv="refresh" content="0;url=fury.html"></head>
<body style="background:#11131a"><a href="fury.html" style="color:#f0f2f8">進入 LEGO 模型工坊</a></body></html>
''')
print("ok")
