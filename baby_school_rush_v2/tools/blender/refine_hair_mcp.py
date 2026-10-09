import bpy, math, json
from math import sin,cos,pi,sqrt
scene=bpy.context.scene;rig=bpy.data.objects['BSR_Rig'];col=rig.users_collection[0]
assert scene.name=='BSR_Schoolgirl_Model_v1'
for o in list(scene.objects):
 if o.name.startswith('BSR_Hair_Back_'):bpy.data.objects.remove(o,do_unlink=True)
v=[];f=[];N=40
rings=[(3.49,.47,.35),(3.32,.55,.43),(3.10,.58,.48),(2.88,.59,.49),(2.64,.60,.51),(2.40,.59,.53),(2.15,.56,.55)]
for k,(z,rx,ry) in enumerate(rings):
 for j in range(N+1):
  a=-.32+(pi+.64)*j/N;wave=.008*cos(j*pi/2)
  v.append(((rx+wave)*cos(a),.035+(ry+wave)*sin(a),z+(.035*cos(j*pi/2) if k==len(rings)-1 else 0)))
for k in range(len(rings)-1):
 for j in range(N):a=k*(N+1)+j;f.append((a,a+1,a+N+2,a+N+1))
me=bpy.data.meshes.new('BSR_Hair_Long_Mesh');me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new('BSR_Hair_Long',me);col.objects.link(o);o.data.materials.append(bpy.data.materials['MAT_Hair_DarkBrown']);o.parent=rig
for p in me.polygons:p.use_smooth=True
g=o.vertex_groups.new(name='head');g.add(list(range(len(v))),1,'REPLACE');m=o.modifiers.new('BSR_Skin','ARMATURE');m.object=rig;m=o.modifiers.new('Soft_Hair','SUBSURF');m.levels=1;m.render_levels=1;m=o.modifiers.new('Hair_Thickness','SOLIDIFY');m.thickness=.045
for o in scene.objects:
 if o.name.startswith('BSR_Hair_Bangs'):
  for vtx in o.data.vertices:
   x,y,z=vtx.co;term=max(.01,1-(x/.59)**2-((z-3.16)/.62)**2);vtx.co.y=.03-.475*sqrt(term)-.017
  o.modifiers['Hair_Thickness'].thickness=.055
scene.render.image_settings.file_format='PNG'
OUT='/Users/kuma-roger/Documents/babygame/baby_school_rush_v2/artifacts/schoolgirl_3d_v1'
for label in ['Preview','Side','Back','Front']:
 scene.camera=bpy.data.objects['CAM_'+label];scene.render.filepath=OUT+'/'+label.lower()+'.png';bpy.ops.render.render(write_still=True)
scene.camera=bpy.data.objects['CAM_Preview'];scene.render.filepath=OUT+'/preview.png'
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/BSR_Schoolgirl_Apose_v1.blend')
with open(OUT+'/model_report.json') as f:r=json.load(f)
meshes=[o for o in scene.objects if o.type=='MESH' and o.name.startswith('BSR_')]
r['objects']=[{'name':o.name,'type':o.type} for o in sorted(scene.objects,key=lambda o:o.name)];r['mesh_count']=len(meshes);r['base_faces']=sum(len(o.data.polygons) for o in meshes)
with open(OUT+'/model_report.json','w') as f:json.dump(r,f,ensure_ascii=False,indent=2)
print({'mesh_count':r['mesh_count'],'base_faces':r['base_faces'],'saved':True})
