"""生成圖的人物越過了格線時，依連通區塊的歸屬（中心落在哪一格）重新排到留白更大的新表上。
用法：python relayout_by_ownership.py <in.png> <rows> <cols> <out.png> [green|magenta]"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, rows, cols, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
key = sys.argv[5] if len(sys.argv) > 5 else 'green'
a = np.array(Image.open(src).convert('RGB')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
bg = (g > 170) & (r < 120) & (b < 120) if key == 'green' else (r > 200) & (g < 80) & (b > 200)
labels, n = ndimage.label(~bg, structure=np.ones((3, 3)))
h, w = bg.shape
ch, cw = h / rows, w / cols
pad = int(max(ch, cw) * 0.25)
color = (0, 255, 0) if key == 'green' else (255, 0, 255)
sheet = np.zeros((rows * (int(ch) + 2 * pad), cols * (int(cw) + 2 * pad), 3), np.uint8)
sheet[:] = color
centers = ndimage.center_of_mass(np.ones_like(labels), labels, range(1, n + 1))
sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1))
for idx, ((cy, cx), size) in enumerate(zip(centers, sizes), start=1):
    if size < 30:
        continue
    rr, cc = min(rows - 1, int(cy // ch)), min(cols - 1, int(cx // cw))
    ys, xs = np.where(labels == idx)
    dy = rr * (int(ch) + 2 * pad) + pad - int(rr * ch)
    dx = cc * (int(cw) + 2 * pad) + pad - int(cc * cw)
    sheet[ys + dy, xs + dx] = a[ys, xs]
Image.fromarray(sheet).save(out)
print(out, sheet.shape, 'components', n)
