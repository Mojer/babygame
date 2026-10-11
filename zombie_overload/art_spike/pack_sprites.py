"""把 AI 生成並經 generate2dsprite 處理過的影格，縮到遊戲尺寸、套像素風收尾、產生變體，打包成圖集。

用法（Python 3.10+，需要 numpy、Pillow）：
    python art_spike/pack_sprites.py
輸出：public/sprites/horde.png/.json、explosion.png/.json
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "public" / "sprites"

# 遊戲內身高（世界像素）：普通殭屍 26，裝甲殭屍依原圖比例自然變大
ZOMBIE_WALKER_PX = 26
PLAYER_PX = 28
BOOM_PX = 72
PALETTE_COLORS = 64
CHARACTER_IDS = ["akane", "yu"]
# 第二版：茜雙手扛大砲、宇拿輕機槍（第一版球桿／拳風在 proc/akane、proc/yu）
# 角色素材資料夾：(側面 4 格, 朝下／朝上 2×4)。茜＝側掛重砲（砲管水平）；宇＝輕機槍
CHARACTER_DIRS = {"akane": ("akane_level_side", "akane_level_dirs"), "yu": ("yu2", "yu_dirs")}
MUTANT_PX = 54
SKINS: dict[str, tuple[str, str]] = {}  # 外觀提案（目前沒有；茜已定案為側掛重砲）
PORTRAIT_H = 160
FACADE_W = 64
PROP_WIDTH = {
    "car_red": 38, "car_blue": 38, "car_police": 38, "car_taxi": 38, "wreck_side": 38,
    "car_front": 22, "wreck_front": 22, "planter": 34, "bench": 28, "bin": 11, "barrier": 28,
    "lamp": 11, "hydrant": 11, "crates": 20, "cones": 18, "cart": 24, "fountain": 118, "ship": 150, "device": 64,
}


def muted(im: Image.Image, sat: float = 0.85, bright: float = 0.95) -> Image.Image:
    """場景降彩度、略壓暗，讓角色與特效跳出來。"""
    a = np.array(im.convert("RGBA")).astype(np.float32)
    lum = (a[..., 0] * 0.3 + a[..., 1] * 0.59 + a[..., 2] * 0.11)[..., None]
    a[..., :3] = (lum + (a[..., :3] - lum) * sat) * bright
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def area_resize(im: Image.Image, scale: float) -> Image.Image:
    """預乘 alpha 的面積縮小，避免透明邊緣發黑或發亮。"""
    w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    return im.convert("RGBa").resize((w, h), Image.Resampling.BOX).convert("RGBA")


def binary_alpha(im: Image.Image, threshold: int = 110) -> Image.Image:
    a = np.array(im)
    a[..., 3] = np.where(a[..., 3] >= threshold, 255, 0)
    a[a[..., 3] == 0] = 0
    return Image.fromarray(a)


def body_height(im: Image.Image) -> int:
    box = im.getbbox()
    return box[3] - box[1] if box else 0


def crop_symmetric(frames: list[Image.Image]) -> tuple[list[Image.Image], float]:
    """整排影格用同一個裁切框，並讓腳的中心落在框的正中央（左右翻轉時身體不會跳）。回傳 (影格, 腳底錨點 y)。"""
    arrs = [np.array(f)[..., 3] > 0 for f in frames]
    ys = [np.where(a.any(axis=1))[0] for a in arrs]
    top = min(y[0] for y in ys)
    bottom = max(y[-1] for y in ys)
    # 腳的中心：最下方 25% 不透明像素的平均 x（第一格）
    a0 = arrs[0]
    rows = np.arange(a0.shape[0])
    lower = (rows >= bottom - (bottom - top) * 0.25)[:, None] & a0
    feet_x = float(np.where(lower)[1].mean())
    xs = [np.where(a.any(axis=0))[0] for a in arrs]
    left = min(x[0] for x in xs)
    right = max(x[-1] for x in xs)
    half = int(np.ceil(max(feet_x - left, right - feet_x))) + 1
    cx = int(round(feet_x))
    box = (cx - half, top, cx + half + 1, bottom + 2)
    out = [f.crop(box) for f in frames]
    h = box[3] - box[1]
    return out, (bottom + 1 - top) / h


def to_white(im: Image.Image) -> Image.Image:
    a = np.array(im)
    a[a[..., 3] > 0, :3] = 255
    return Image.fromarray(a)


def to_ice(im: Image.Image) -> Image.Image:
    a = np.array(im).astype(np.float32)
    lum = (a[..., 0] * 0.3 + a[..., 1] * 0.59 + a[..., 2] * 0.11) / 255
    ramp = np.array([[40, 90, 140], [120, 190, 240], [190, 232, 255], [240, 250, 255]], np.float32)
    idx = np.clip((lum * 1.4 + 0.15) * 3, 0, 3).astype(int)
    a[..., :3] = ramp[idx]
    return Image.fromarray(a.astype(np.uint8))


def to_corpse(im: Image.Image) -> Image.Image:
    """倒地屍體：轉 90 度、壓暗偏紅，烘進地面當貼花。"""
    a = np.array(im.rotate(90, expand=True)).astype(np.float32)
    a[..., 0] = a[..., 0] * 0.5 + 18
    a[..., 1] = a[..., 1] * 0.38
    a[..., 2] = a[..., 2] * 0.36
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def key_green(rgb: np.ndarray) -> np.ndarray:
    """綠幕去背＋邊緣去綠（generate2dmap 的物件抽取只支援洋紅底）。"""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    key = (g > 170) & (r < 120) & (b < 120) & (g - np.maximum(r, b) > 80)
    out = np.dstack([rgb, np.where(key, 0, 255)]).astype(np.int32)
    spill = (~key) & (g > np.maximum(r, b))
    out[..., 1] = np.where(spill, np.maximum(r, b), g)
    out[key] = 0
    return np.clip(out, 0, 255).astype(np.uint8)


def shared_palette(frames: dict[str, Image.Image], colors: int) -> dict[str, Image.Image]:
    """所有角色共用一組調色盤（像素風一致性）。"""
    names = list(frames)
    widths = [frames[n].width for n in names]
    strip = Image.new("RGB", (sum(widths), max(f.height for f in frames.values())))
    x = 0
    for n in names:
        f = frames[n]
        bg = Image.new("RGB", f.size, (0, 0, 0))
        bg.paste(f, mask=f.split()[3])
        strip.paste(bg, (x, 0))
        x += f.width
    pal = strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    out = {}
    for n in names:
        f = frames[n]
        q = f.convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")
        r = q.convert("RGBA")
        r.putalpha(f.split()[3])
        out[n] = r
    return out


def pack(frames: dict[str, Image.Image], anchors: dict[str, float], name: str, width: int = 512) -> None:
    order = sorted(frames, key=lambda n: -frames[n].height)
    x = y = 1
    row_h = 0
    rects = {}
    for n in order:
        f = frames[n]
        if x + f.width + 1 > width:
            x = 1
            y += row_h + 2
            row_h = 0
        rects[n] = (x, y, f.width, f.height)
        x += f.width + 2
        row_h = max(row_h, f.height)
    height = 1 << int(np.ceil(np.log2(y + row_h + 2)))
    atlas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    meta = {}
    for n, (fx, fy, w, h) in rects.items():
        f = np.array(frames[n])
        f[f[..., 3] == 0] = 0  # 透明像素顏色歸零，任何混合模式都不會漏色
        atlas.paste(Image.fromarray(f), (fx, fy))
        meta[n] = {"x": fx, "y": fy, "w": w, "h": h}
        if n in anchors:
            meta[n]["ay"] = round(anchors[n], 4)
    OUT.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT / f"{name}.png", optimize=True)
    (OUT / f"{name}.json").write_text(json.dumps({"image": f"{name}.png", "frames": meta}, indent=1))
    print(f"{name}.png {atlas.size} frames={len(meta)}")


def load_rows(paths: list[Path], cols: int) -> list[list[Image.Image]]:
    ims = [Image.open(p).convert("RGBA") for p in paths]
    return [ims[i : i + cols] for i in range(0, len(ims), cols)]


def main() -> None:
    zpaths = [HERE / "proc" / "zombies" / f"walk-{i}.png" for i in range(1, 17)]
    rows = load_rows(zpaths, 4)
    walker_h = np.mean([body_height(f) for f in rows[0]])
    zscale = ZOMBIE_WALKER_PX / walker_h
    frames: dict[str, Image.Image] = {}
    anchors: dict[str, float] = {}
    # 巨大變異體（小 Boss）當作第 5 種殭屍，身高另外指定
    mrow = [Image.open(HERE / "proc" / "mutant" / f"walk-{i}.png").convert("RGBA") for i in range(1, 5)]
    rows.append(mrow)
    for k, row in enumerate(rows):
        scale = MUTANT_PX / np.mean([body_height(f) for f in row]) if k == 4 else zscale
        small = [binary_alpha(area_resize(f, scale)) for f in row]
        cropped, ay = crop_symmetric(small)
        for i, f in enumerate(cropped):
            frames[f"z{k}_{i}"] = f
            anchors[f"z{k}_{i}"] = ay
    # 可選角色（茜、宇）：各自 4 格跑步，身高統一
    for cid in CHARACTER_IDS:
        ppaths = sorted((HERE / "proc" / CHARACTER_DIRS[cid][0]).glob("player_walk-*.png"), key=lambda p: int(p.stem.split("-")[1]))
        prow = [Image.open(p).convert("RGBA") for p in ppaths]
        pscale = PLAYER_PX / np.mean([body_height(f) for f in prow])
        psmall, pay = crop_symmetric([binary_alpha(area_resize(f, pscale)) for f in prow])
        for i, f in enumerate(psmall):
            frames[f"p_{cid}_{i}"] = f
            anchors[f"p_{cid}_{i}"] = pay
        # 朝下（面向鏡頭）／朝上（背對）各 4 格：同一張 2×4 表，上排朝下、下排朝上
        dpaths = sorted((HERE / "proc" / CHARACTER_DIRS[cid][1]).glob("player_walk-*.png"), key=lambda p: int(p.stem.split("-")[1]))
        drows = [[Image.open(p).convert("RGBA") for p in dpaths[:4]], [Image.open(p).convert("RGBA") for p in dpaths[4:8]]]
        for dname, drow in zip(["down", "up"], drows):
            dscale = PLAYER_PX / np.mean([body_height(f) for f in drow])
            dsmall, day = crop_symmetric([binary_alpha(area_resize(f, dscale)) for f in drow])
            for i, f in enumerate(dsmall):
                frames[f"p_{cid}_{dname}_{i}"] = f
                anchors[f"p_{cid}_{dname}_{i}"] = day

    # 殭屍與主角分開建調色盤：混在一起時殭屍佔多數，主角的粉紅、藍色會被吃掉
    zf = shared_palette({n: f for n, f in frames.items() if n.startswith("z")}, PALETTE_COLORS)
    # 主角只有 2 位、畫面中最重要：不量化，略提彩度（縮小後顏色會被描邊平均掉）
    pf = {n: muted(f, 1.25, 1.04) for n, f in frames.items() if n.startswith("p_")}
    frames = {**zf, **pf}

    # 場景物件：每種物件各自指定遊戲內寬度（生成圖內部比例和角色不一致），錨點在底部中央
    prop_frames: dict[str, Image.Image] = {}
    for name, width in PROP_WIDTH.items():
        pack_dir = {"fountain": "fountain", "ship": "ship", "device": "device"}.get(name, "props")
        src = HERE / "proc" / pack_dir / name.replace("_", "-") / "prop.png"
        im = Image.open(src).convert("RGBA")
        im = im.crop(im.getbbox())
        prop_frames[f"prop_{name}"] = binary_alpha(area_resize(muted(im), width / im.width))
    prop_frames = shared_palette(prop_frames, PALETTE_COLORS)
    for n, f in prop_frames.items():
        frames[n] = f
        anchors[n] = 1.0
    for k in range(5):
        frames[f"z{k}_white"] = to_white(frames[f"z{k}_0"])
        frames[f"z{k}_ice"] = to_ice(frames[f"z{k}_0"])
        frames[f"z{k}_corpse"] = to_corpse(frames[f"z{k}_1"])
        anchors[f"z{k}_white"] = anchors[f"z{k}_ice"] = anchors[f"z{k}_0"]
    # 外觀提案（例：茜的重型大砲版），存在就打包成 p_<skin>…，遊戲以 ?skin= 或選角卡切換
    for skin, (side_dir, dirs_dir) in SKINS.items():
        if not (HERE / "proc" / side_dir).exists() or not (HERE / "proc" / dirs_dir).exists():
            continue
        side = sorted((HERE / "proc" / side_dir).glob("player_walk-*.png"), key=lambda p: int(p.stem.split("-")[1]))
        dirs = sorted((HERE / "proc" / dirs_dir).glob("player_walk-*.png"), key=lambda p: int(p.stem.split("-")[1]))
        for dname, paths in [("", side[:4]), ("_down", dirs[:4]), ("_up", dirs[4:8])]:
            row = [Image.open(p).convert("RGBA") for p in paths]
            sc = PLAYER_PX / np.mean([body_height(f) for f in row])
            small, ay = crop_symmetric([binary_alpha(area_resize(f, sc)) for f in row])
            for i, f in enumerate(small):
                frames[f"p_{skin}{dname}_{i}"] = muted(f, 1.25, 1.04)
                anchors[f"p_{skin}{dname}_{i}"] = ay
            frames[f"p_{skin}{dname}_white"] = to_white(frames[f"p_{skin}{dname}_0"])
            anchors[f"p_{skin}{dname}_white"] = ay
    for cid in CHARACTER_IDS:
        for suffix in ["", "_down", "_up"]:
            frames[f"p_{cid}{suffix}_white"] = to_white(frames[f"p_{cid}{suffix}_0"])
            anchors[f"p_{cid}{suffix}_white"] = anchors[f"p_{cid}{suffix}_0"]
    # 角色攻擊特效（黑底透明 → 加法混合），保留柔和 alpha
    atk = Image.open(HERE / "gen" / "attacks2-1" / "generated.png").convert("RGBA")
    # 砲彈拖尾越過了格線，用人工確認過的框裁切
    attack_boxes = {
        "atk_akane": ((20, 120, 730, 480), 28),
        "atk_yu": ((735, 245, 1210, 380), 16),
        "hit_akane": ((50, 580, 720, 1190), 30),
        "hit_yu": ((770, 700, 1190, 1110), 14),
    }
    for name, (box, width) in attack_boxes.items():
        cell = atk.crop(box)
        ca = np.array(cell)
        ca[ca[..., 3] < 24] = 0  # 生成圖的「透明」底其實是 alpha=1，先清掉才裁得出外框
        cell = Image.fromarray(ca)
        cell = cell.crop(cell.getbbox())
        frames[name] = area_resize(cell, width / cell.width)
    # 頭像：給選角畫面與 HUD（HTML 用，不進圖集）
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = np.array(Image.open(HERE / "gen" / "portraits2-1" / "relayout.png").convert("RGB")).astype(np.int32)
    for i, cid in enumerate(CHARACTER_IDS):
        half = sheet[:, i * sheet.shape[1] // 2 : (i + 1) * sheet.shape[1] // 2]
        im = Image.fromarray(key_green(half))
        im = im.crop(im.getbbox())
        area_resize(im, PORTRAIT_H / im.height).save(OUT / f"portrait_{cid}.png", optimize=True)
    # 選角畫面用的終極武器圖與小人（HTML 用，同樣取自圖集素材）
    for src, dst in [("prop_device", "ult_pylon"), ("prop_ship", "ult_ship"), ("p_akane_0", "mini_akane"), ("p_yu_0", "mini_yu")]:
        if src in frames:
            frames[src].save(OUT / f"{dst}.png", optimize=True)
    pack(frames, anchors, "horde", width=1024)
    print("props:", {n: frames[n].size for n in prop_frames})

    # 地圖圖集：無縫地磚（128）＋建築立面模組（寬 64），在載入時畫進地面層
    map_frames: dict[str, Image.Image] = {}
    for n in ["plaza", "asphalt", "sidewalk", "roof"]:
        map_frames[f"tile_{n}"] = muted(Image.open(HERE / "proc" / f"terrain-{n}" / f"{n}-1.png").convert("RGBA"), 0.8, 0.92)
    for n in ["shop_green", "shop_red", "apartment", "brick"]:
        im = Image.open(HERE / "proc" / "facades" / n.replace("_", "-") / "prop.png").convert("RGBA")
        im = im.crop(im.getbbox())
        map_frames[f"facade_{n}"] = binary_alpha(area_resize(muted(im), FACADE_W / im.width))
    pack(map_frames, {}, "map", width=1024)
    print("sizes:", {n: frames[n].size for n in ["z0_0", "z1_0", "z2_0", "z3_0", "p_akane_0", "p_yu_0", "atk_akane", "atk_yu"]})

    # 爆炸：黑底 → alpha（火焰不透明、煙半透明），用一般混合繪製（煙不會被加法混合變成發光）
    sheet = np.array(Image.open(HERE / "gen" / "explosion-1" / "generated.png").convert("RGB")).astype(np.float32)
    h, w = sheet.shape[:2]
    boom = {}
    for r in range(4):
        for c in range(4):
            cell = sheet[round(r * h / 4) : round((r + 1) * h / 4), round(c * w / 4) : round((c + 1) * w / 4)]
            mx = cell.max(axis=2) / 255
            # 亮度決定透明度；顏色保留原值（不反預乘），深灰煙才會是「半透明深灰」而不是被提亮成白煙
            alpha = np.clip((mx - 0.05) * 2.4, 0, 1)
            rgba = np.dstack([cell, alpha * 255]).astype(np.uint8)
            im = Image.fromarray(rgba).resize((BOOM_PX, BOOM_PX), Image.Resampling.BOX)
            a = np.array(im)
            a[..., 3] = (np.round(a[..., 3] / 255 * 4) / 4 * 255).astype(np.uint8)  # 4 階透明度，像素風
            boom[f"ex_{r * 4 + c}"] = Image.fromarray(a)
    pack(boom, {}, "explosion", width=512)


if __name__ == "__main__":
    main()
