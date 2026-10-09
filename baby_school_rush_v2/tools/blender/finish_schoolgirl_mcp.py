import bpy, math, json, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
OUT='/Users/kuma-roger/Documents/babygame/baby_school_rush_v2/artifacts/schoolgirl_3d_v1'
scene=bpy.context.scene;rig=bpy.data.objects['BSR_Rig']
assert scene.name=='BSR_Schoolgirl_Model_v1'
# Give hair ribbons a soft silhouette; retain their editable quad cages.
for o in scene.objects:
 if o.type=='MESH' and o.name.startswith(('BSR_Hair_Bangs','BSR_Hair_Back','BSR_Hair_Side')):
  if not o.modifiers.get('Soft_Hair'):
   m=o.modifiers.new('Soft_Hair','SUBSURF');m.levels=1;m.render_levels=1
   bpy.context.view_layer.objects.active=o
   bpy.ops.object.modifier_move_up(modifier=m.name)
# Remove thigh/waist intersection by adjusting only the skirt's top rings.
for name in ['BSR_Skirt','BSR_Waistband']:
 o=bpy.data.objects[name]
 if not o.get('waist_clearance_fixed'):
  for v in o.data.vertices:
   if v.co.z>1.70:v.co.x*=1.16;v.co.y*=1.12
  o['waist_clearance_fixed']=True
# Rig front remains -Y. Limits are on root local X/Z (horizontal world X/Y).
rig.pose.bones['root'].lock_location=(True,False,True)
rig['rig_notes']='FK humanoid; A-pose; front -Y; root local X/Z locked for in-place use. Hair/head and backpack/chest rigid attachments. Skirt currently pelvis weighted.'
# View-specific UV reference planes use the packed original turnaround directly.
refs=bpy.data.collections['BSR_References'];im=bpy.data.images.get('d89f758f-945a-40db-9667-e9975c6ad64c.png')
specs=[('Front',.01,.255,(-2.3,.9,1.9),(math.pi/2,0,0)),('Back',.255,.51,(2.3,.9,1.9),(math.pi/2,0,0)),('Side',.755,.99,(1.7,0,1.9),(math.pi/2,0,math.pi/2))]
for label,u0,u1,pos,rot in specs:
 old=bpy.data.objects.get('REF_'+label)
 if old:old.hide_viewport=True
 name='REF_Plane_'+label
 if bpy.data.objects.get(name):continue
 width=3.8*(im.size[0]*(u1-u0))/(im.size[1]*.92)
 me=bpy.data.meshes.new(name);me.from_pydata([(-width/2,-1.9,0),(width/2,-1.9,0),(width/2,1.9,0),(-width/2,1.9,0)],[],[(0,1,2,3)]);me.update()
 uv=me.uv_layers.new(name='Reference_Crop');coords=[(u0,.03),(u1,.03),(u1,.95),(u0,.95)]
 for i in range(4):uv.data[i].uv=coords[i]
 o=bpy.data.objects.new(name,me);refs.objects.link(o);o.location=pos;o.rotation_euler=rot;o.hide_render=True
 ma=bpy.data.materials.new('MAT_REF_'+label);ma.use_nodes=True;nd=ma.node_tree.nodes;nd.clear();tex=nd.new('ShaderNodeTexImage');tex.image=im;em=nd.new('ShaderNodeEmission');out=nd.new('ShaderNodeOutputMaterial');ma.node_tree.links.new(tex.outputs['Color'],em.inputs[0]);ma.node_tree.links.new(em.outputs[0],out.inputs[0]);o.data.materials.append(ma)
 o['reference_view']=label;o['source_uv_interval']=[u0,u1];o.hide_select=True
# Verify weights numerically, then reversible elbow/knee deformation tests.
bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
meshes=[o for o in scene.objects if o.type=='MESH' and o.name.startswith('BSR_')]
invalid=[];unweighted=0
for o in meshes:
 if not any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers):invalid.append(o.name)
 valid={g.index for g in o.vertex_groups if g.name in rig.data.bones and rig.data.bones[g.name].use_deform}
 for v in o.data.vertices:
  total=sum(g.weight for g in v.groups if g.group in valid)
  if abs(total-1)>1e-4:unweighted+=1
tests=[]
for bn,on in [('forearm.L','BSR_Arm.L'),('shin.L','BSR_Leg.L')]:
 o=bpy.data.objects[on];pb=rig.pose.bones[bn];before=[v.co.copy() for v in o.evaluated_get(dg).data.vertices];saved=pb.matrix_basis.copy()
 try:
  pb.rotation_mode='XYZ';pb.rotation_euler.x=math.radians(30);bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();after=[v.co.copy() for v in o.evaluated_get(dg).data.vertices]
  moved=max((a-b).length for a,b in zip(after,before));assert moved>.01
  tests.append({'bone':bn,'mesh':on,'max_vertex_displacement':round(moved,5),'pass':True})
 finally:
  pb.matrix_basis=saved;bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
zs=[(o.matrix_world@v.co).z for o in meshes for v in o.data.vertices]
report={'scene':scene.name,'objects':[{'name':o.name,'type':o.type} for o in sorted(scene.objects,key=lambda o:o.name)],'bones':[{'name':b.name,'parent':b.parent.name if b.parent else None} for b in rig.data.bones],'mesh_count':len(meshes),'base_faces':sum(len(o.data.polygons) for o in meshes),'height':round(max(zs)-min(zs),4),'min_z':round(min(zs),4),'unweighted_or_unnormalized_vertices':unweighted,'missing_armature_modifiers':invalid,'deformation_tests':tests,'actions':[o.name for o in meshes+[rig] if o.animation_data and o.animation_data.action],'limitations':['FK rig, no IK controls yet','Skirt weighted to pelvis; high knee poses require skirt bones or corrective weights','Long hair currently head weighted; secondary-motion bones to be added later','Body consists of separate garment/limb meshes, not a seamless production retopology','Face has simple geometry, no facial rig']}
assert not invalid and unweighted==0
with open(OUT+'/model_report.json','w') as f:json.dump(report,f,indent=2,ensure_ascii=False)
scene.camera=bpy.data.objects['CAM_Preview'];scene.render.filepath=OUT+'/preview.png'
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/BSR_Schoolgirl_Apose_v1.blend')
bpy.ops.render.render(write_still=True)
for label in ['Front','Back','Side']:
 scene.camera=bpy.data.objects['CAM_'+label];scene.render.filepath=OUT+'/'+label.lower()+'.png';bpy.ops.render.render(write_still=True)
scene.camera=bpy.data.objects['CAM_Preview'];scene.render.filepath=OUT+'/preview.png';bpy.ops.wm.save_as_mainfile(filepath=OUT+'/BSR_Schoolgirl_Apose_v1.blend')
print(json.dumps({k:report[k] for k in ['mesh_count','base_faces','height','unweighted_or_unnormalized_vertices','deformation_tests','actions']}))
