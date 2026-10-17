"""Bake layout masks over one generated cloud painting; no repeated ground stamps.
The same baked image is used by the game, the map bundle and the preview.
"""
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def bake_ground(source, layout):
    size = (2048, 2048)
    base = Image.open(source).convert('RGB').resize(size, Image.Resampling.LANCZOS)
    mask = Image.new('L', size)
    draw = ImageDraw.Draw(mask)
    for a,b in layout['roadsH']: draw.rounded_rectangle((128,a,1920,b), radius=42, fill=255)
    for a,b in layout['roadsV']: draw.rounded_rectangle((a,128,b,1920), radius=42, fill=255)
    draw.rounded_rectangle((848,784,1200,1296), radius=76, fill=255)
    for p in layout['props']:
        if p['kind']=='candyHouse':
            cx=p['x']+p['w']/2;cy=p['y']+p['h']
            draw.ellipse((cx-p['w']*.72,cy-48,cx+p['w']*.72,cy+48),fill=255)
    # One union mask gives intersections and village pads the same soft material edge.
    mask = mask.filter(ImageFilter.GaussianBlur(12))
    icing = Image.blend(base,Image.new('RGB',size,(255,174,205)),.34)
    sprinkles=Image.new('RGBA',size)
    sd=ImageDraw.Draw(sprinkles)
    rng=random.Random(0xcad2)
    colors=[(203,148,186,90),(164,201,194,90),(215,181,115,90),(179,161,201,90)]
    for i in range(1300):
        x=rng.randrange(128,1920);y=rng.randrange(128,1920)
        dx,dy=rng.choice([(3,1),(1,3),(-2,2),(3,-1)])
        sd.line((x,y,x+dx,y+dy),fill=colors[i%4],width=2)
    icing=Image.alpha_composite(icing.convert('RGBA'),sprinkles).convert('RGB')
    result=np.array(Image.composite(icing,base,mask),dtype=float)
    yy,xx=np.indices(size)
    edge=np.minimum.reduce([xx,yy,2047-xx,2047-yy])
    fade=np.clip(1-edge/180,0,1)[...,None]*.34
    result=result*(1-fade)+np.array([145,123,191])*fade
    return Image.fromarray(np.rint(result).astype('uint8')).convert('RGBA')
