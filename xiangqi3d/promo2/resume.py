import os, shutil, subprocess, sys, tempfile, time
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
START = int(sys.argv[1]) if len(sys.argv) > 1 else 0  # a range only: python3 resume.py 1560 [END]
TOTAL = int(sys.argv[2]) if len(sys.argv) > 2 else 3510
def count(): return len([f for f in os.listdir("out/frames") if f.endswith(".png") and START <= int(f[:4]) < TOTAL])
def first_missing():
    s = {int(f[:4]) for f in os.listdir("out/frames") if f.endswith(".png")}
    return next(i for i in range(START, TOTAL) if i not in s)
while count() < TOTAL - START:
    n = first_missing()
    d = tempfile.mkdtemp()
    p = subprocess.Popen([CHROME, "--headless=new", f"--user-data-dir={d}", "--window-size=1920,1200",
        "--hide-scrollbars", "--mute-audio", "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding", "--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist",
        f"http://127.0.0.1:5240/promo2/?render&sink=5243&from={n}&to={TOTAL}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    last, t = n, time.time()
    while time.time() - t < 15:
        time.sleep(2)
        c = count()
        if c >= TOTAL - START: break
        if c != last: last, t = c, time.time()
    p.kill(); p.wait(); shutil.rmtree(d, True)
    print(f"{n} -> {count()}", flush=True)
