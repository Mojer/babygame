"""Preserve generated candy detail in a 2x atlas; logical sizes/anchors stay fixed.
Existing generated originals only. No new image generation or altered collision.
Run after pack_candy.py. City/Japan enemies and props remain exact nearest-neighbour replicas.
"""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / 'public/sprites'

def main():
    defs = json.loads((OUT/'horde_stages.json').read_text())
    atlas = Image.open(OUT/defs['image']).convert('RGBA').resize((2048,4096), Image.Resampling.NEAREST)
    joints = json.loads((HERE/'animation/motion.json').read_text())['joints']
    def put(key, image):
        f = defs['frames'][key]
        assert image.size == (f['w']*2,f['h']*2), key
        atlas.paste(image,(f['x']*2,f['y']*2))
    def resize(im, size):
        return im.convert('RGBa').resize(size,Image.Resampling.LANCZOS).convert('RGBA')
    checks=[]
    for k in range(5):
        f=defs['frames'][f'c{k}_0']; w,h=f['w']*2,f['h']*2
        # Original finish adds 2px and animation adds 6px on each side.
        master=Image.open(HERE/f'master-{k}.png').convert('RGBA')
        master=master.crop(master.getbbox())
        src=Image.new('RGBA',(w,h));src.paste(resize(master,(w-32,h-32)),(16,16))
        pixels=np.array(src.convert('RGBa'),dtype=float)
        yy,xx=np.indices((h,w),dtype=float)
        poses=[]
        for frame in range(8):
            phase=frame*math.tau/8
            sx,sy=xx.copy(),yy.copy()
            for _ in range(6):
                dx,dy=np.zeros_like(xx),np.zeros_like(yy)
                for cx,cy,rx,ry,ax,ay,offset in joints[k]:
                    weight=np.exp(-(((sx-12-cx*(w-24))/(rx*(w-24)))**2+((sy-12-cy*(h-24))/(ry*(h-24)))**2)*2)
                    dx+=weight*ax*2*math.sin(phase+offset)
                    dy+=weight*ay*2*math.cos(phase+offset)
                sx,sy=xx-dx,yy-dy
            sx=np.clip(sx,0,w-1.001);sy=np.clip(sy,0,h-1.001)
            ix,iy=sx.astype(int),sy.astype(int)
            fx,fy=(sx-ix)[...,None],(sy-iy)[...,None]
            p=(pixels[iy,ix]*(1-fx)+pixels[iy,ix+1]*fx)*(1-fy)+(pixels[iy+1,ix]*(1-fx)+pixels[iy+1,ix+1]*fx)*fy
            im=Image.fromarray(np.uint8(np.clip(p,0,255)),'RGBa').convert('RGBA')
            poses.append(im);put(f'c{k}_{frame}',im)
        arr=np.array(poses[0]);white=arr.copy();white[...,:3]=255
        put(f'c{k}_white',Image.fromarray(white))
        ice=arr.copy();lum=ice[...,:3].mean(axis=2)/255
        ice[...,0]=80+lum*120;ice[...,1]=160+lum*80;ice[...,2]=220+lum*35
        put(f'c{k}_ice',Image.fromarray(ice))
        corpse=np.array(poses[0].rotate(90,expand=True));corpse[...,:3]=(corpse[...,:3]*.45).astype('uint8')
        put(f'c{k}_corpse',Image.fromarray(corpse))
        unique=len({im.tobytes() for im in poses})
        clear=all(not np.any(np.array(im)[[0,-1],:,3]) and not np.any(np.array(im)[:,[0,-1],3]) for im in poses)
        assert unique==8 and clear
        checks.append({'kind':k,'unique_frames':unique,'transparent_border':clear})
    for prop in (HERE/'props-final').glob('*/prop.png'):
        key=next((key for key in defs['frames'] if key.lower()=='prop_'+prop.parent.name),None)
        if not key: continue
        f=defs['frames'][key];im=Image.open(prop).convert('RGBA');im=im.crop(im.getbbox())
        padded=Image.new('RGBA',(f['w']*2,f['h']*2))
        padded.paste(resize(im,(f['w']*2-8,f['h']*2-8)),(4,4));put(key,padded)
    # Rebuild both protagonists from the original extracted poses, not pixel replicas.
    import sys
    sys.path.insert(0,str(HERE.parent))
    from pack_sprites import CHARACTER_DIRS, body_height, area_resize, binary_alpha, muted
    player_checks=[]
    for cid,(side,dirs) in CHARACTER_DIRS.items():
        numbered=lambda folder: sorted((HERE.parent/'proc'/folder).glob('player_walk-*.png'),key=lambda p:int(p.stem.split('-')[-1]))
        directional=numbered(dirs)
        for suffix,paths in [('',numbered(side)),('_down',directional[:4]),('_up',directional[4:8])]:
            row=[Image.open(p).convert('RGBA') for p in paths]
            scale=28/np.mean([body_height(im) for im in row])
            low=[binary_alpha(area_resize(im,scale)) for im in row]
            masks=[np.array(im)[...,3]>0 for im in low]
            ys=[np.where(a.any(axis=1))[0] for a in masks]
            top=min(y[0] for y in ys);bottom=max(y[-1] for y in ys)
            lower=(np.arange(masks[0].shape[0])>=bottom-(bottom-top)*.25)[:,None]&masks[0]
            feet=float(np.where(lower)[1].mean())
            xs=[np.where(a.any(axis=0))[0] for a in masks]
            half=int(np.ceil(max(feet-min(x[0] for x in xs),max(x[-1] for x in xs)-feet)))+1
            center=round(feet)
            box=(int((center-half)*2),int(top*2),int((center+half+1)*2),int((bottom+2)*2))
            for i,(raw,small) in enumerate(zip(row,low)):
                im=muted(resize(raw,(small.width*2,small.height*2)).crop(box),1.15,1.03)
                key=f'p_{cid}{suffix}_{i}';put(key,im)
                if i==0:
                    white=np.array(im);white[...,:3]=255
                    put(f'p_{cid}{suffix}_white',Image.fromarray(white))
                player_checks.append(key)
    atlas.save(OUT/'horde_detail.png')
    # Frames stay in world units; Pixi source resolution accounts for physical texels.
    defs['image']='horde_detail.png';defs['resolution']=2
    (OUT/'horde_detail.json').write_text(json.dumps(defs,separators=(',',':')))
    (HERE/'polish-qa.json').write_text(json.dumps({'art_source':'existing','resolution':2,'logical_sizes_unchanged':True,'checks':checks,'players_from_originals':player_checks},indent=2)+'\n')

if __name__=='__main__':main()
