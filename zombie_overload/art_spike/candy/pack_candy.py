"""Rebuild Candy Dreamland on the shared atlas. Python 3.10+, Pillow, numpy.
Generated original art + existing code-driven cutout animation; no AI video.
Run after pack_japan.py if rebuilding every stage from scratch.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from PIL import Image
from bake_ground import bake_ground

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT/'public/sprites'
sys.path.insert(0, str(HERE.parent/'japan'))
from pack_japan import finish
import animate_yokai as motion

PROP_WIDTHS = {'candyHouse':144, 'rainbowArch':160, 'lollipopTree':60, 'rainbowCandy':44,
               'cupcakeTower':56, 'candyCane':28, 'chocolateFountain':72, 'biscuitBridge':92}
HEIGHTS = [28,32,36,30,66]


def main():
    source = Image.open(HERE/'enemies-source-v2.png').convert('RGBA')
    # Measured gutters recorded separately so the source-to-sprite transform is explicit.
    bands = json.loads((HERE/'enemy-bands.json').read_text())
    defs = json.loads((OUT/'horde_stages.json').read_text())
    frames = defs['frames']
    for key in list(frames):
        if (key.startswith('c') and key[1:2].isdigit()) or key in ['prop_'+name for name in PROP_WIDTHS]: del frames[key]
    base = Image.open(OUT/'horde_stages.png').convert('RGBA')
    atlas = Image.new('RGBA',(1024,2048));atlas.paste(base,(0,0))
    x, y, shelf = 2, max(f['y']+f['h'] for f in frames.values())+4, 0
    def add(name, im, anchor=None):
        nonlocal x,y,shelf
        if x+im.width > atlas.width: x,y,shelf=2,y+shelf+2,0
        if y+im.height > atlas.height: raise ValueError('Atlas overflow')
        atlas.paste(im,(x,y))
        frames[name]={'x':x,'y':y,'w':im.width,'h':im.height,'ay':anchor if anchor is not None else (im.height-2)/im.height}
        x+=im.width+2;shelf=max(shelf,im.height)
    motion.HERE=HERE
    motion.NAMES=['lollipop','cotton-candy','gummy-bear','cookie','chocolate-lava']
    # Opposing hands and feet, cotton-candy sway, boss shoulder/cane heave.
    motion.JOINTS=[
      [(.22,.91,.20,.17,2.8,0,0),(.76,.91,.20,.17,-2.8,-1,0),(.1,.66,.18,.2,-2,1,0),(.88,.66,.18,.2,2,-1,0)],
      [(.3,.16,.3,.25,2,1,0),(.75,.35,.22,.3,-1.8,1,0),(.25,.9,.2,.15,2,-1,0),(.75,.9,.2,.15,-2,1,0)],
      [(.22,.88,.20,.2,2.8,0,0),(.77,.88,.20,.2,-2.8,-1,0),(.15,.55,.2,.2,-2,1,0),(.85,.55,.2,.2,2,-1,0)],
      [(.24,.91,.2,.16,2.5,0,0),(.76,.91,.2,.16,-2.5,-1,0),(.12,.65,.19,.22,-2,1,0),(.88,.65,.19,.22,2,-1,0)],
      [(.3,.91,.18,.14,3,0,0),(.77,.91,.18,.14,-3,-1,0),(.12,.62,.18,.28,-2,1,0),(.9,.62,.18,.28,2,-1,0),(.5,.18,.35,.20,1,1,0)],
    ]
    # Larger limb excursions remain readable at the actual 28–66px display size.
    motion.JOINTS = [[(cx,cy,rx*1.2,ry*1.2,ax*1.7,ay*1.5,phase)
                      for cx,cy,rx,ry,ax,ay,phase in joints] for joints in motion.JOINTS]
    groups=[]
    for k,(left,right) in enumerate(bands):
        master=source.crop((left,0,right,source.height))
        master=master.crop(master.getchannel('A').point(lambda a:255 if a>=110 else 0).getbbox())
        master.save(HERE/f'master-{k}.png')
        walk,anchor=motion.poses(finish(master,height=HEIGHTS[k]),k);groups.append(walk)
        for f,im in enumerate(walk): add(f'c{k}_{f}',im,anchor)
        im=walk[0];white=np.array(im);white[white[...,3]>0,:3]=255
        add(f'c{k}_white',Image.fromarray(white),anchor)
        ice=np.array(im);lum=ice[...,:3].mean(axis=2)/255
        ice[...,0]=80+lum*120;ice[...,1]=160+lum*80;ice[...,2]=220+lum*35;ice[ice[...,3]==0]=0
        add(f'c{k}_ice',Image.fromarray(ice),anchor)
        corpse=np.array(im.rotate(90,expand=True));corpse[...,:3]=(corpse[...,:3]*.45).astype('uint8')
        add(f'c{k}_corpse',Image.fromarray(corpse))
        finish(master,height=72).save(OUT/f'candy_{k}.png')
    motion.save_review(groups)
    props={}
    for name,width in PROP_WIDTHS.items():
        im=finish(Image.open(HERE/'props-final'/name.lower()/'prop.png'),width=width)
        props[name]=im;add('prop_'+name,im)
    # Trim unused atlas height to the next power of two; all stages share its GPU source.
    used=y+shelf+2
    final_h=1<<(used-1).bit_length()
    atlas.crop((0,0,1024,final_h)).save(OUT/'horde_stages.png')
    (OUT/'horde_stages.json').write_text(json.dumps(defs,separators=(',',':')))
    tile_names=['cloud','frosting','biscuit','cloudBorder']
    tiles={}
    sheet=Image.new('RGBA',(512,128));tf={}
    terrain=json.loads((HERE/'terrain/terrain-bundle.json').read_text())
    for i,name in enumerate(tile_names):
        paths=list((HERE/'terrain').glob(f'{name.lower()}-*.png'))
        tile=Image.open(paths[0]).convert('RGBA');tiles[name]=tile
        sheet.paste(tile,(i*128,0));tf['tile_'+name]={'x':i*128,'y':0,'w':128,'h':128}
    sheet.save(OUT/'map_candy.png');(OUT/'map_candy.json').write_text(json.dumps({'image':'map_candy.png','frames':tf}))
    layout=json.loads((HERE/'map-layout.json').read_text())
    ground=bake_ground(HERE/'cloud-ground-source-v2.png',layout)
    ground.save(HERE/'ground-v2.png')
    ground.save(HERE/'ground.png')
    ground.convert('RGB').save(OUT/'candy-ground-v2.jpg',quality=94)
    runtime=HERE/'runtime-props';runtime.mkdir(exist_ok=True)
    for name,im in props.items():im.save(runtime/(name+'.png'))
    rects=[]
    for gy in range(128):
        gx=0
        while gx<128:
            if not layout['blocked'][gy*128+gx]:gx+=1;continue
            start=gx
            while gx<128 and layout['blocked'][gy*128+gx]:gx+=1
            rects.append([start*16,gy*16,(gx-start)*16,16])
    objects=[]
    for i,p in enumerate(layout['props']):
        im=props[p['kind']]
        objects.append({'id':f'prop-{i}','prop':p['kind'],'image':'runtime-props/'+p['kind']+'.png',
          'x':p['x']+p['w']/2,'y':p['y']+p['h'],'anchor_px':[im.width/2,im.height],
          'sortY':p['y']+p['h']/2,'solid':False,'layer':'props'})
    anchors={'rainbow-plaza':[1024,1120],'candy-village':[496,464],'east-rainbow':[1552,752],
             'chocolate-fountain':[1024,864],'west-garden':[736,1248],'east-garden':[1328,1248]}
    bundle={'schema':'generate2dmap.map_bundle.v2','id':'candy','name':'糖果夢境','art_source':'host_image',
      'world':{'width':2048,'height':2048,'unit':'px'},'layers':[{'name':'ground','kind':'image','image':'ground.png'},{'name':'props','kind':'objects'}],
      'objects':objects,'collision':{'actorRadius':5,'rects':rects,'rectCell':16},'nav':{'cell':3},
      'spawns':[{'id':'start',**layout['spawn']}], 'anchors':{n:{'point':p,'approach':p} for n,p in anchors.items()}}
    (HERE/'map-bundle.json').write_text(json.dumps(bundle,ensure_ascii=False,separators=(',',':')))
    for p in sorted(layout['props'],key=lambda p:p['y']+p['h']/2):
        im=props[p['kind']];ground.alpha_composite(im,(round(p['x']+p['w']/2-im.width/2),round(p['y']+p['h']-im.height)))
    ground.save(HERE/'map-preview.png')
    (HERE/'provenance.json').write_text(json.dumps({'art_source':'host_image','route':'image_gen','model':'built-in image generation',
      'estimateUsd':None,'motion_source':'code','animation':'8 unique cutout poses; no generated video',
      'enemy_heights':HEIGHTS,'prop_widths':PROP_WIDTHS,'terrain_finish':'single full-world cloud painting with feathered union-mask frosting paths; no repeated ground tiles',
      'ground_recipe':'bake_ground.py', 'runtime_motion':'src/render/candyMotion.ts; simulation-clock gait and per-kind hop, lean, squash',
      'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.glob('*source*.png')}},indent=2)+'\n')
    print(json.dumps({'atlas_height':final_h,'frames':len(frames),'enemies':5,'animation_frames':40}))

if __name__=='__main__':main()
