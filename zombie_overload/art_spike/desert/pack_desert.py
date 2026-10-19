"""Append HD desert artwork to the accepted shared atlas without changing other stages.
Generated master stills + eight code-deformed poses per creature (no generated video).
"""
from pathlib import Path
import json, math, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE=Path(__file__).resolve().parent
OUT=HERE.parents[1]/'public/sprites'
NAMES=['mummy','jackal','scarab','reaper','titan']
HEIGHTS=[32,34,40,42,82]
PROPS={'pyramid':264,'desertGate':176,'obelisk':42,'palm':84,'sphinx':108,'ruinColumn':48,'sarcophagus':56,'soulBrazier':36}
JOINTS=[
 [( .18,.64,.22,.23,2.4,1,0),(.84,.64,.22,.23,-2.4,1,1),(.3,.92,.24,.16,2.8,1,0),(.72,.92,.24,.16,-2.8,1,0),(.14,.4,.22,.35,2,1,1)],
 [(.2,.58,.24,.24,3,1,0),(.8,.58,.24,.24,-3,1,0),(.3,.9,.24,.20,3.2,1,0),(.72,.9,.24,.2,-3.2,1,0)],
 [(.14,.61,.23,.24,2,1,0),(.86,.61,.23,.24,-2,1,0),(.3,.91,.24,.16,2.2,1,0),(.72,.91,.24,.16,-2.2,1,0)],
 [(.25,.5,.24,.3,2,1,0),(.8,.5,.22,.35,-2,1,0),(.5,.88,.48,.22,2.2,1.8,0)],
 [(.18,.62,.23,.24,2.8,1.6,0),(.82,.62,.23,.24,-2.8,1.6,0),(.3,.92,.22,.16,3.2,1,0),(.72,.92,.22,.16,-3.2,1,0)]
]
def resize(im,size):return im.convert('RGBa').resize(size,Image.Resampling.LANCZOS).convert('RGBA')
def main():
 defs=json.loads((OUT/'horde_detail.json').read_text());frames=defs['frames']
 base=Image.open(OUT/defs['image']).convert('RGBA');atlas=Image.new('RGBA',base.size);atlas.paste(base)
 x,y,shelf=2,max(f['y']+f['h'] for f in frames.values())+4,0
 def add(key,im,ay=1):
  nonlocal x,y,shelf
  assert im.width%2==0 and im.height%2==0
  w,h=im.width//2,im.height//2
  if x+w>1024:x,y,shelf=2,y+shelf+4,0
  if y+h>2048:raise ValueError('Atlas overflow')
  atlas.paste(im,(x*2,y*2));frames[key]={'x':x,'y':y,'w':w,'h':h,'ay':ay}
  x+=w+4;shelf=max(shelf,h)
 qa=[];allposes=[]
 (HERE/'animation').mkdir(exist_ok=True);(HERE/'runtime-props').mkdir(exist_ok=True)
 for k,name in enumerate(NAMES):
  source=Image.open(HERE/(name+'-source.png')).convert('RGBA')
  assert np.array(source.getchannel('A')).min()==0,'Source must have native alpha: '+name
  source=source.crop(source.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox())
  h=HEIGHTS[k]*2;w=round(source.width*h/source.height/2)*2
  pad=16;body=resize(source,(w,h));src=Image.new('RGBA',(w+pad*2,h+pad*2));src.paste(body,(pad,pad))
  pixels=np.array(src.convert('RGBa'),dtype=float);yy,xx=np.indices(pixels.shape[:2],dtype=float);poses=[]
  for frame in range(8):
   phase=frame*math.tau/8;sx,sy=xx.copy(),yy.copy()
   for _ in range(6):
    dx,dy=np.zeros_like(xx),np.zeros_like(yy)
    for cx,cy,rx,ry,ax,ay,offset in JOINTS[k]:
     weight=np.exp(-(((sx-pad-cx*w)/(rx*w))**2+((sy-pad-cy*h)/(ry*h))**2)*2)
     dx+=weight*ax*2*math.sin(phase+offset);dy+=weight*ay*2*math.cos(phase+offset)
    sx,sy=xx-dx,yy-dy
   sx=np.clip(sx,0,src.width-1.001);sy=np.clip(sy,0,src.height-1.001)
   ix,iy=sx.astype(int),sy.astype(int);fx,fy=(sx-ix)[...,None],(sy-iy)[...,None]
   sampled=(pixels[iy,ix]*(1-fx)+pixels[iy,ix+1]*fx)*(1-fy)+(pixels[iy+1,ix]*(1-fx)+pixels[iy+1,ix+1]*fx)*fy
   im=Image.fromarray(np.uint8(np.clip(sampled,0,255)),'RGBa').convert('RGBA');poses.append(im)
   im.save(HERE/'animation'/f'{name}-{frame}.png');add(f'e{k}_{frame}',im,(pad+h)/src.height)
  white=np.array(poses[0]);white[...,:3]=255;add(f'e{k}_white',Image.fromarray(white),(pad+h)/src.height)
  ice=np.array(poses[0]);lum=ice[...,:3].mean(axis=2)/255
  ice[...,0]=80+lum*120;ice[...,1]=160+lum*80;ice[...,2]=220+lum*35;add(f'e{k}_ice',Image.fromarray(ice),(pad+h)/src.height)
  corpse=np.array(poses[0].rotate(90,expand=True));corpse[...,:3]=(corpse[...,:3]*.48).astype('uint8');add(f'e{k}_corpse',Image.fromarray(corpse))
  resize(source,(round(source.width*72/source.height),72)).save(OUT/f'desert_{k}.png')
  unique=len({im.tobytes() for im in poses});clear=all(not np.any(np.array(im)[[0,-1],:,3]) and not np.any(np.array(im)[:,[0,-1],3]) for im in poses)
  assert unique==8 and clear,name
  qa.append({'name':name,'unique_frames':unique,'clear_border':clear,'body_height_world':HEIGHTS[k]});allposes.append(poses)
 props={};sheet=Image.open(HERE/'props-v2-source.png').convert('RGBA')
 assert np.array(sheet.getchannel('A')).min()==0,'Prop background must have native alpha'
 boxes=[(40,48,556,484),(578,73,981,474),(1058,20,1270,497),(1382,45,1732,492),(58,513,499,870),(567,486,868,863),(942,516,1387,861),(1441,489,1701,872)]
 (HERE/'prop-source-boxes.json').write_text(json.dumps(boxes))
 for i,(name,width) in enumerate(PROPS.items()):
  # Measured ownership gutters preserve the whole objects in this irregular generated kit.
  box=boxes[i];cell=sheet.crop(tuple(round(v*(sheet.width/1774 if j%2==0 else sheet.height/887)) for j,v in enumerate(box)))
  box=cell.getchannel('A').point(lambda a:255 if a>64 else 0).getbbox();assert box,name
  assert box[0]>0 and box[1]>0 and box[2]<cell.width and box[3]<cell.height,'Prop clipping: '+name
  raw=cell.crop(box);height=round(raw.height*width/raw.width)
  im=resize(raw,(width*2,height*2));pad=4;padded=Image.new('RGBA',(im.width+8,im.height+8));padded.paste(im,(pad,pad));add('prop_'+name,padded)
  props[name]=resize(padded,(padded.width//2,padded.height//2));props[name].save(HERE/'runtime-props'/(name+'.png'))
 atlas.save(OUT/'horde_world.png');defs['image']='horde_world.png';(OUT/'horde_world.json').write_text(json.dumps(defs,separators=(',',':')))
 layout=json.loads((HERE/'map-layout.json').read_text());ground=Image.open(HERE/'ground-source.png').convert('RGBA').resize((2048,2048),Image.Resampling.LANCZOS)
 shadows=Image.new('RGBA',ground.size);d=ImageDraw.Draw(shadows)
 for p in layout['props']:
  cx=p['x']+p['w']/2;cy=p['y']+p['h'];rx=p['w']*.48;ry=max(4,p['h']*.28)
  d.ellipse((cx-rx,cy-ry,cx+rx,cy+ry),fill=(83,56,31,45))
 ground=Image.alpha_composite(ground,shadows.filter(ImageFilter.GaussianBlur(5)));ground.save(HERE/'ground.png');ground.convert('RGB').save(OUT/'desert-ground-v1.jpg',quality=94)
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
  im=props[p['kind']];objects.append({'id':f'prop-{i}','prop':p['kind'],'image':'runtime-props/'+p['kind']+'.png','x':p['x']+p['w']/2,'y':p['y']+p['h'],'anchor_px':[im.width/2,im.height],'sortY':p['y']+p['h']/2,'solid':False,'layer':'props'})
 anchors={'pyramid-court':[1024,944],'west-gate':[496,832],'east-gate':[1552,832],'west-oasis':[656,1328],'east-oasis':[1392,1328],'southern-tombs':[1024,1664]}
 bundle={'schema':'generate2dmap.map_bundle.v2','id':'desert','name':'沙漠冥域','art_source':'host_image','world':{'width':2048,'height':2048,'unit':'px'},'layers':[{'name':'ground','kind':'image','image':'ground.png'},{'name':'props','kind':'objects'}],'objects':objects,'collision':{'actorRadius':5,'rects':rects,'rectCell':16},'nav':{'cell':3},'spawns':[{'id':'start',**layout['spawn']}],'anchors':{n:{'point':p,'approach':p} for n,p in anchors.items()}}
 (HERE/'map-bundle.json').write_text(json.dumps(bundle,ensure_ascii=False,separators=(',',':')))
 for p in sorted(layout['props'],key=lambda p:p['y']+p['h']/2):
  im=props[p['kind']];ground.alpha_composite(im,(round(p['x']+p['w']/2-im.width/2),round(p['y']+p['h']-im.height)))
 ground.save(HERE/'map-preview.png')
 cover=Image.open(HERE/'cover-source.png').convert('RGB');cover.save(OUT.parent/'covers/desert-cover-v1.jpg',quality=93)
 review=Image.new('RGB',(1100,300),'#17212b');draw=ImageDraw.Draw(review)
 for k,poses in enumerate(allposes):
  im=poses[0];review.paste(im,(k*220+(220-im.width)//2,270-im.height),im);draw.text((k*220+12,10),NAMES[k],fill='white')
 review.save(HERE/'enemies-review.png')
 (HERE/'animation-qa.json').write_text(json.dumps({'status':'pass','art_source':'host_image','motion_source':'code','checks':qa},indent=2)+'\n')
 (HERE/'provenance.json').write_text(json.dumps({'art_source':'host_image','route':'image_gen','model':'built-in image generation','estimateUsd':None,'motion_source':'code','motion':'8 bilinear joint-deformed poses per generated master; no generated video','atlas_resolution':2,'prop_count':len(layout['props']),'boundary':'closed sandstone outer 128px band','sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.glob('*source.png')}},indent=2)+'\n')
 print(json.dumps({'frames':len(frames),'props':len(layout['props']),'used_world_height':y+shelf}))
if __name__=='__main__':main()
