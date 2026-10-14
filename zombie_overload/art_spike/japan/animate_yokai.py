"""Bake eight cutout-deformation poses from the approved generated enemy stills.

No video/image model is used for motion. Smooth local joint displacement is sampled
with nearest-neighbour filtering to preserve the existing game's pixel palette.
All frames share a canvas and foot anchor; gameplay position/collision are unchanged.
"""
import json
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
NAMES = ['kappa', 'tengu', 'oni', 'kasa', 'kaiju']
# (joint normalized x,y; influence radius x,y; horizontal and vertical excursion;
# phase). The two feet/arms alternate, while wings and the umbrella have their own gait.
JOINTS = [
    [( .22,.91,.20,.20, 2.8,0,0),(.76,.84,.21,.17,-2.8,-1,0),
     (.50,.70,.16,.20,-2,1,0),(.88,.65,.15,.22,2,-1,0)],
    [( .08,.30,.20,.35,1,4,0),(.89,.34,.18,.35,-1,4,0),
     (.26,.91,.18,.14,2,-1,0),(.76,.90,.18,.14,-2,1,0)],
    [( .16,.91,.18,.17,2.7,0,0),(.66,.83,.19,.17,-2.7,-1,0),
     (.19,.60,.19,.20,-2,1,0),(.88,.38,.18,.40,2.5,-1,0)],
    [( .76,.68,.22,.24,2.4,1,0),(.43,.89,.22,.22,-2,1,0),
     (.50,.36,.45,.36,1,0,0)],
    [( .08,.64,.20,.26,0,4,0),(.31,.92,.16,.16,3,0,0),
     (.84,.89,.17,.17,-3,-1,0),(.63,.70,.14,.22,-2,1,0),
     (.94,.68,.14,.20,2,-1,0)],
]


def poses(master, kind):
    w, h = master.size
    pad = 6
    source = Image.new('RGBA', (w + pad * 2, h + pad * 2))
    source.paste(master, (pad, pad))
    pixels = np.array(source)
    yy, xx = np.indices(pixels.shape[:2], dtype=float)
    result = []
    for frame in range(8):
        phase = frame * math.tau / 8
        def displacement(x, y):
            dx, dy = np.zeros_like(x), np.zeros_like(y)
            for cx, cy, rx, ry, ax, ay, offset in JOINTS[kind]:
                weight = np.exp(-(((x-pad-cx*w)/(rx*w))**2 + ((y-pad-cy*h)/(ry*h))**2)*2)
                swing = math.sin(phase + offset)
                dx += weight * ax * swing
                dy += weight * ay * math.cos(phase + offset)
            return dx, dy
        # Inverse sampling avoids gaps/overlaps caused by scattering moved pixels.
        sx, sy = xx.copy(), yy.copy()
        for _ in range(6):
            dx, dy = displacement(sx, sy)
            sx, sy = xx-dx, yy-dy
        ix, iy = np.rint(sx).astype(int), np.rint(sy).astype(int)
        valid = (ix >= 0)&(ix < source.width)&(iy >= 0)&(iy < source.height)
        out = np.zeros_like(pixels)
        out[valid] = pixels[iy[valid], ix[valid]]
        result.append(Image.fromarray(out))
    return result, (pad + h - 2) / source.height


def save_review(groups):
    out = HERE / 'animation'
    out.mkdir(exist_ok=True)
    sheet = Image.new('RGB', (8*160, 5*180), '#17212b')
    draw = ImageDraw.Draw(sheet)
    summary = []
    for k, frames in enumerate(groups):
        for f, im in enumerate(frames):
            im.save(out / f'{NAMES[k]}-{f}.png')
            zoom = 2 if k == 4 else 2
            preview = im.resize((im.width*zoom, im.height*zoom), Image.Resampling.NEAREST)
            sheet.paste(preview, (f*160+(160-preview.width)//2,k*180+16), preview)
        draw.text((4,k*180+2), NAMES[k], fill='white')
        unique = len({im.tobytes() for im in frames})
        border_clear = all(not np.any(np.array(im)[[0,-1],:,3]) and not np.any(np.array(im)[:,[0,-1],3]) for im in frames)
        summary.append({'kind':NAMES[k], 'frames':len(frames), 'unique_frames':unique,
                        'fixed_canvas':len({im.size for im in frames})==1, 'transparent_border':border_clear})
        if unique != 8 or not border_clear:
            raise ValueError('Animation QA failed: '+NAMES[k])
    sheet.save(out/'review.png')
    clips = []
    for f in range(8):
        canvas = Image.new('RGB', (500, 180), '#17212b')
        label = ImageDraw.Draw(canvas)
        for k, frames in enumerate(groups):
            im = frames[f].resize((frames[f].width*2, frames[f].height*2), Image.Resampling.NEAREST)
            hop = round(abs(math.sin(f*math.tau/8)) * (10 if k == 3 else 6 if k == 1 else 2))
            canvas.paste(im, (k*100+(100-im.width)//2, 165-im.height-hop), im)
            label.text((k*100+10,5), NAMES[k], fill='white')
        clips.append(canvas)
    clips[0].save(out/'motion-preview.gif', save_all=True, append_images=clips[1:], duration=110, loop=0)
    (out/'qa.json').write_text(json.dumps({'status':'pass','checks':summary}, indent=2)+'\n')
    (out/'motion.json').write_text(json.dumps({'art_source':'host_image', 'motion_source':'code',
      'method':'local joint deformation of approved enemy stills; no generated video',
      'frames':8, 'joints':JOINTS, 'names':NAMES}, indent=2)+'\n')
