"""Pack generated Japanese assets alongside the existing atlas. Python 3.10+, Pillow, numpy.

Run from zombie_overload: python art_spike/japan/pack_japan.py
Sources: built-in image_gen masters, programmatically animated cutout poses.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image
from animate_yokai import poses, save_review

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / 'public' / 'sprites'
PROP_WIDTHS = {'shrine': 152, 'torii': 120, 'sakura': 88, 'stoneLantern': 20,
               'yatai': 80, 'bamboo': 52, 'komainu': 32, 'bridge': 88}


def finish(im: Image.Image, *, height=None, width=None) -> Image.Image:
    im = im.convert('RGBA')
    im = im.crop(im.getbbox())
    scale = height / im.height if height else width / im.width
    size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
    im = im.convert('RGBa').resize(size, Image.Resampling.BOX).convert('RGBA')
    a = np.array(im)
    a[..., 3] = np.where(a[..., 3] >= 110, 255, 0)
    a[a[..., 3] == 0] = 0
    im = Image.fromarray(a)
    pal = im.convert('RGB').quantize(colors=64, dither=Image.Dither.NONE).convert('RGBA')
    pal.putalpha(im.getchannel('A'))
    padded = Image.new('RGBA', (pal.width + 4, pal.height + 4))
    padded.paste(pal, (2, 2))
    return padded


def main():
    base = Image.open(OUT / 'horde.png').convert('RGBA')
    atlas = Image.new('RGBA', (1024, 1024))
    atlas.paste(base, (0, 0))
    defs = json.loads((OUT / 'horde.json').read_text())
    defs['image'] = 'horde_stages.png'
    frames = defs['frames']
    x, y, shelf = 2, base.height + 2, 0

    def add(name, im):
        nonlocal x, y, shelf
        if x + im.width > atlas.width:
            x, y, shelf = 2, y + shelf + 2, 0
        if y + im.height > atlas.height:
            raise ValueError('Stage atlas overflow')
        atlas.paste(im, (x, y))
        frames[name] = {'x': x, 'y': y, 'w': im.width, 'h': im.height, 'ay': (im.height - 2) / im.height}
        x += im.width + 2
        shelf = max(shelf, im.height)

    source = Image.open(HERE / 'enemies-source.png').convert('RGBA')
    bands = [(19, 310), (317, 735), (745, 1197), (1203, 1526), (1543, 2158)]
    animations = []
    for k, ((left, right), height) in enumerate(zip(bands, [26, 30, 36, 30, 64])):
        master = source.crop((left, 0, right, source.height))
        # Ignore near-invisible generation fringe before sizing and locating joints.
        master = master.crop(master.getchannel('A').point(lambda a: 255 if a >= 110 else 0).getbbox())
        walk, anchor = poses(finish(master, height=height), k)
        animations.append(walk)
        for f, pose in enumerate(walk):
            add(f'y{k}_{f}', pose)
            frames[f'y{k}_{f}']['ay'] = anchor
        im = walk[0]
        white = np.array(im)
        white[white[..., 3] > 0, :3] = 255
        add(f'y{k}_white', Image.fromarray(white))
        ice = np.array(im)
        lum = ice[..., :3].mean(axis=2) / 255
        ice[..., 0] = 80 + lum * 120
        ice[..., 1] = 160 + lum * 80
        ice[..., 2] = 220 + lum * 35
        ice[ice[..., 3] == 0] = 0
        add(f'y{k}_ice', Image.fromarray(ice))
        corpse = np.array(im.rotate(90, expand=True))
        corpse[..., :3] = (corpse[..., :3] * .45).astype('uint8')
        add(f'y{k}_corpse', Image.fromarray(corpse))
        finish(master, height=72).save(OUT / f'yokai_{k}.png')

    save_review(animations)
    props = {}
    for name, width in PROP_WIDTHS.items():
        props[name] = finish(Image.open(HERE / 'props-clean' / name.lower() / 'prop.png'), width=width)
        add('prop_' + name, props[name])
    atlas.save(OUT / 'horde_stages.png')
    (OUT / 'horde_stages.json').write_text(json.dumps(defs, separators=(',', ':')))

    tiles = {}
    # Tiles produced by generate2dmap; each terrain has one variant.
    for name in ['moss', 'stone', 'wood', 'roof']:
        candidates = list((HERE / 'terrain').glob(f'**/{name}*.png'))
        if not candidates:
            candidates = list((HERE / 'terrain').glob(f'**/terrain-{["moss", "stone", "wood", "roof"].index(name)}-*.png'))
        if not candidates: raise ValueError(f'Missing terrain tile: {name}')
        tiles[name] = Image.open(candidates[0]).convert('RGBA')
    sheet = Image.new('RGBA', (512, 128))
    mapframes = {}
    for i, (name, tile) in enumerate(tiles.items()):
        sheet.paste(tile, (i * 128, 0))
        mapframes['tile_' + name] = {'x': i * 128, 'y': 0, 'w': 128, 'h': 128}
    sheet.save(OUT / 'map_japan.png')
    (OUT / 'map_japan.json').write_text(json.dumps({'image': 'map_japan.png', 'frames': mapframes}))

    # Representative stage preview from the actual layout, generated tiles and props.
    layout = json.loads((HERE / 'map-layout.json').read_text())
    ground = Image.new('RGBA', (2048, 2048))
    for ty in range(0, 2048, 128):
        for tx in range(0, 2048, 128): ground.paste(tiles['moss'], (tx, ty))
    stone = Image.new('RGBA', ground.size)
    for ty in range(0, 2048, 128):
        for tx in range(0, 2048, 128): stone.paste(tiles['stone'], (tx, ty))
    for a, b in layout['roadsH']: ground.paste(stone.crop((128, a, 1920, b)), (128, a))
    for a, b in layout['roadsV']: ground.paste(stone.crop((a, 128, b, 1920)), (a, 128))
    ground.paste(stone.crop((864, 816, 1184, 1280)), (864, 816))
    # Export a layered validation bundle with exactly the game's raster collision data.
    for bounds in [(0, 0, 2048, 128), (0, 1920, 2048, 2048), (0, 128, 128, 1920), (1920, 128, 2048, 1920)]:
        area = Image.new('RGBA', (bounds[2] - bounds[0], bounds[3] - bounds[1]))
        for ty in range(0, area.height, 128):
            for tx in range(0, area.width, 128): area.paste(tiles['roof'], (tx, ty))
        ground.paste(area, (bounds[0], bounds[1]))
    ground.save(HERE / 'ground.png')
    runtime_props = HERE / 'runtime-props'
    runtime_props.mkdir(exist_ok=True)
    for name, im in props.items(): im.save(runtime_props / (name + '.png'))
    rects = []
    for gy in range(128):
        gx = 0
        while gx < 128:
            if not layout['blocked'][gy * 128 + gx]:
                gx += 1
                continue
            start = gx
            while gx < 128 and layout['blocked'][gy * 128 + gx]: gx += 1
            rects.append([start * 16, gy * 16, (gx - start) * 16, 16])
    objects = []
    for i, p in enumerate(layout['props']):
        im = props[p['kind']]
        objects.append({'id': f'prop-{i}', 'prop': p['kind'], 'image': 'runtime-props/' + p['kind'] + '.png',
                        'x': p['x'] + p['w'] / 2, 'y': p['y'] + p['h'], 'anchor_px': [im.width / 2, im.height],
                        'sortY': p['y'] + p['h'] / 2, 'solid': False, 'layer': 'props'})
    bundle = {'schema': 'generate2dmap.map_bundle.v2', 'id': 'japan', 'name': '百鬼夜行', 'art_source': 'host_image',
              'world': {'width': 2048, 'height': 2048, 'unit': 'px'},
              'layers': [{'name': 'ground', 'kind': 'image', 'image': 'ground.png'}, {'name': 'props', 'kind': 'objects'}],
              'objects': objects, 'collision': {'actorRadius': 5, 'rects': rects, 'rectCell': 16}, 'nav': {'cell': 3},
              'spawns': [{'id': 'start', **layout['spawn']}],
              'anchors': {name: {'point': point, 'approach': point} for name, point in
                          [('main-shrine', [1024, 912]), ('main-torii', [1024, 1096]), ('north-garden', [496, 624]),
                           ('east-garden', [1552, 624]), ('festival-west', [320, 1488]), ('festival-east', [1728, 1488])]}}
    (HERE / 'map-bundle.json').write_text(json.dumps(bundle, ensure_ascii=False, separators=(',', ':')))
    for p in sorted(layout['props'], key=lambda p: p['y'] + p['h'] / 2):
        im = props[p['kind']]
        ground.alpha_composite(im, (round(p['x'] + p['w'] / 2 - im.width / 2), round(p['y'] + p['h'] - im.height)))
    ground.save(HERE / 'map-preview.png')
    ground.crop((672, 712, 1376, 1144)).resize((1056, 648), Image.Resampling.NEAREST).convert('RGB').save(OUT / 'japan-preview.png')
    provenance = {'art_source': 'host_image', 'route': 'image_gen', 'model': 'built-in image generation',
                  'animation': 'eight unique code-driven cutout poses per enemy; no generated video',
                  'motion_source': 'code', 'motion_spec': 'animation/motion.json',
                  'world': [2048, 2048], 'logical_view': [600, 400], 'camera': '3/4 orthographic',
                  'enemy_heights': [26, 30, 36, 30, 64], 'prop_widths': PROP_WIDTHS,
                  'sources': {n: hashlib.sha256((HERE / n).read_bytes()).hexdigest()
                              for n in ['enemies-source.png', 'environment-source.png']}}
    (HERE / 'provenance.json').write_text(json.dumps(provenance, indent=2))
    print(json.dumps({'atlas': str(OUT / 'horde_stages.png'), 'map': str(OUT / 'map_japan.png'), 'frames': len(frames)}))


if __name__ == '__main__': main()
