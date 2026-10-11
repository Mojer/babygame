"""把 auto-boxes 合併在一起的物件，沿著全空的欄／列切開，輸出 --boxes-file 用的 JSON。"""
import json, sys
import numpy as np
from PIL import Image

def runs(mask1d, min_gap=4):
    idx = np.where(mask1d)[0]
    if len(idx) == 0: return []
    out, start, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - prev > min_gap:
            out.append((start, prev)); start = i
        prev = i
    out.append((start, prev))
    return out

def main(img, boxes_json, labels, out):
    a = np.array(Image.open(img).convert('RGB')).astype(int)
    key = (a[..., 0] > 200) & (a[..., 1] < 80) & (a[..., 2] > 200)
    fg = ~key
    result = []
    for x0, y0, x1, y1 in json.loads(boxes_json):
        sub = fg[y0:y1, x0:x1]
        for cx0, cx1 in runs(sub.any(axis=0)):
            col = sub[:, cx0:cx1 + 1]
            for ry0, ry1 in runs(col.any(axis=1)):
                piece = col[ry0:ry1 + 1]
                if piece.sum() < 400: continue
                xs = runs(piece.any(axis=0))
                result.append([int(v) for v in (x0 + cx0 + xs[0][0], y0 + ry0, x0 + cx0 + xs[-1][1] + 1, y0 + ry1 + 1)])
    # 閱讀順序：先依列（中心 y 分群）再依 x
    result.sort(key=lambda b: ((b[1] + b[3]) / 2 // 300, b[0]))
    labels = labels.split(',')
    print(len(result), 'boxes for', len(labels), 'labels')
    for b, l in zip(result, labels): print(l, b)
    pad = 3  # 外擴幾像素，避免切到描邊
    items = [{'id': l, 'box': [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad]} for l, b in zip(labels, result)]
    json.dump({'schema': 'forge-crop-boxes/v1', 'items': items}, open(out, 'w'), indent=1)

main(*sys.argv[1:])
