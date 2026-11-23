import os, shutil, subprocess, tempfile, time
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TOTAL = 1800
def count(): return len([f for f in os.listdir("out/frames") if f.endswith(".png")])
def first_missing():
    s = {int(f[:4]) for f in os.listdir("out/frames") if f.endswith(".png")}
    return next(i for i in range(TOTAL) if i not in s)
while count() < TOTAL:
    n = first_missing()
    d = tempfile.mkdtemp()
    p = subprocess.Popen([CHROME, "--headless=new", f"--user-data-dir={d}", "--window-size=1920,1200",
        "--hide-scrollbars", "--mute-audio", "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding", "--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist",
        f"http://127.0.0.1:5240/promo/?render&sink=5242&from={n}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    last, t = n, time.time()
    while time.time() - t < 15:
        time.sleep(2)
        c = count()
        if c >= TOTAL: break
        if c != last: last, t = c, time.time()
    p.kill(); p.wait(); shutil.rmtree(d, True)
    print(f"{n} -> {count()}", flush=True)
