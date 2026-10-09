import bpy, math, os, json
from mathutils import Vector
from math import sin, cos, pi

OUT='/Users/kuma-roger/Documents/babygame/baby_school_rush_v2/artifacts/schoolgirl_3d_v1'
REF='/Users/kuma-roger/Documents/babygame/baby_school_rush/stuff/characters/d89f758f-945a-40db-9667-e9975c6ad64c.png'
os.makedirs(OUT,exist_ok=True)
scene=bpy.data.scenes.get('BSR_Schoolgirl_Model_v1')
assert scene is None or len(scene.objects)==0, 'Scene contains objects; inspect before replay'
scene=scene or bpy.data.scenes.new('BSR_Schoolgirl_Model_v1')
bpy.context.window.scene=scene
col=bpy.data.collections.new('BSR_Character'); scene.collection.children.link(col)
parts=[]
def mat(n,c):
 m=bpy.data.materials.new(n); m.diffuse_color=(*c,1); m.use_nodes=True
 m.node_tree.nodes.clear();p=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');out=m.node_tree.nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(p.outputs[0],out.inputs[0]);p.inputs['Base Color'].default_value=(*c,1); p.inputs['Roughness'].default_value=.82
 return m
skin=mat('MAT_Skin_Peach',(.78,.43,.27)); pink=mat('MAT_Shirt_Rose',(.78,.28,.40)); white=mat('MAT_Warm_White',(.93,.86,.73)); gray=mat('MAT_Skirt_Charcoal',(.105,.10,.12)); hair=mat('MAT_Hair_DarkBrown',(.038,.019,.024)); hairhi=mat('MAT_Hair_SoftBrown',(.065,.032,.033)); bag=mat('MAT_Bag_Pink',(.82,.20,.37)); sole=mat('MAT_Sole_Ivory',(.86,.78,.64)); shoe=mat('MAT_Shoe_Sand',(.57,.41,.29)); dark=mat('MAT_Ink',(.018,.012,.017)); eye=mat('MAT_Iris_Brown',(.16,.068,.034)); blush=mat('MAT_Blush',(.83,.25,.23))
def finish(o,n,m,b):
 o.name=n
 for c in list(o.users_collection): c.objects.unlink(o)
 col.objects.link(o); o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 parts.append((o,b)); return o
def ell(n,p,s,m,b):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=p)
 o=bpy.context.object; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,n,m,b)
def box(n,p,s,m,b,r=.05):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=bpy.context.object; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('Rounded_Edges','BEVEL');mod.width=r;mod.segments=3
 bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,n,m,b)
def mesh(n,v,f,m,b):
 d=bpy.data.meshes.new(n+'_Mesh');d.from_pydata(v,[],f);d.update();o=bpy.data.objects.new(n,d);col.objects.link(o)
 return finish(o,n,m,b)
def tube(n,points,radii,m,b,N=12):
 v=[];f=[]
 for k,p in enumerate(points):
  t=(Vector(points[min(k+1,len(points)-1)])-Vector(points[max(0,k-1)])).normalized()
  u=t.cross(Vector((0,1,0))).normalized(); w=t.cross(u).normalized()
  for j in range(N):v.append(Vector(p)+radii[k]*(cos(2*pi*j/N)*u+sin(2*pi*j/N)*w))
 for k in range(len(points)-1):
  for j in range(N):a=k*N+j;d=k*N+(j+1)%N;f.append((a,d,d+N,a+N))
 f.extend([tuple(reversed(range(N))),tuple((len(points)-1)*N+j for j in range(N))])
 return mesh(n,v,f,m,b)
def loft(n,rings,m,b,N=32,pleat=False):
 v=[];f=[]
 for z,rx,ry in rings:
  for j in range(N):
   a=2*pi*j/N; q=(1 if j%4<2 else .94) if pleat else 1
   v.append((rx*cos(a)*q,ry*sin(a)*q,z))
 for k in range(len(rings)-1):
  for j in range(N):a=k*N+j;d=k*N+(j+1)%N;f.append((a,d,d+N,a+N))
 o=mesh(n,v,f,m,b)
 return o

# Four-head-tall proportions; front is -Y, Z is vertical.
ell('BSR_Head',(0,0,3.12),(.55,.44,.59),skin,'head')
ell('BSR_Neck',(0,0,2.58),(.13,.13,.23),skin,'neck')
loft('BSR_Body_Shirt',[(1.78,.32,.22),(1.85,.35,.24),(2.10,.39,.24),(2.34,.43,.23),(2.46,.37,.20),(2.53,.17,.15)],pink,'chest')
ell('BSR_Pelvis',(0,0,1.79),(.32,.22,.25),gray,'pelvis')
loft('BSR_Skirt',[(1.83,.34,.25),(1.77,.36,.27),(1.62,.43,.30),(1.38,.51,.34),(1.16,.57,.37)],gray,'pelvis',64,True)
loft('BSR_Waistband',[(1.77,.36,.265),(1.86,.35,.26)],gray,'pelvis')
for sign,suffix in [(1,'L'),(-1,'R')]:
 x=.21*sign
 points=[(x,0,1.77),(x,-.015,1.45),(x,-.035,1.10),(x,-.035,1.04),(x,-.02,.98),(x,0,.70),(x,0,.35)]
 tube('BSR_Leg.'+suffix,points,[.16,.165,.135,.13,.13,.12,.095],skin,'LEG.'+suffix,16)
 tube('BSR_Sock.'+suffix,[(x,0,.22),(x,0,.32),(x,0,.48)],[.105,.112,.116],dark,'shin.'+suffix,16)
 box('BSR_Shoe.'+suffix,(x,-.12,.17),(.32,.57,.26),shoe,'foot.'+suffix,.10)
 box('BSR_Sole.'+suffix,(x,-.12,.055),(.34,.59,.11),sole,'foot.'+suffix,.045)
 for j in range(3):box('BSR_Lace%d.'%j+suffix,(x,-.21+j*.075,.294),(.21,.027,.022),white,'foot.'+suffix,.01)
 shoulder=(sign*.38,0,2.40);elbow=(sign*.70,-.015,2.03);wrist=(sign*.93,-.05,1.70)
 pts=[shoulder,(sign*.52,0,2.25),(sign*.66,-.01,2.08),elbow,(sign*.74,-.02,1.97),(sign*.84,-.04,1.82),wrist]
 tube('BSR_Arm.'+suffix,pts,[.145,.14,.112,.108,.105,.09,.074],skin,'ARM.'+suffix,16)
 tube('BSR_Sleeve.'+suffix,[shoulder,(sign*.48,0,2.29),(sign*.56,0,2.20)],[.185,.185,.17],pink,'upper_arm.'+suffix,16)
 tube('BSR_Cuff.'+suffix,[(sign*.55,0,2.21),(sign*.58,0,2.17)],[.177,.172],white,'upper_arm.'+suffix,16)
 ell('BSR_Hand.'+suffix,(sign*1.00,-.065,1.59),(.10,.082,.16),skin,'hand.'+suffix)
 ell('BSR_Thumb.'+suffix,(sign*.92,-.12,1.64),(.047,.052,.085),skin,'hand.'+suffix)
 ell('BSR_Ear.'+suffix,(sign*.525,0,3.04),(.095,.09,.145),skin,'head')
 # Eyes sit on the front head surface, with dark upper lashes.
 ell('BSR_EyeWhite.'+suffix,(sign*.205,-.411,3.17),(.143,.035,.118),white,'head')
 ell('BSR_Iris.'+suffix,(sign*.205,-.447,3.16),(.077,.018,.09),eye,'head')
 ell('BSR_Pupil.'+suffix,(sign*.205,-.461,3.17),(.047,.011,.066),dark,'head')
 ell('BSR_EyeSpark.'+suffix,(sign*.18,-.474,3.205),(.022,.008,.026),white,'head')
 tube('BSR_Lash.'+suffix,[(sign*.07,-.427,3.25),(sign*.20,-.448,3.28),(sign*.34,-.405,3.25)],[.022,.024,.016],dark,'head',8)
 ell('BSR_Cheek.'+suffix,(sign*.32,-.375,2.99),(.067,.015,.028),blush,'head')
 # pointed white collar, suspenders, backpack straps
 mesh('BSR_Collar.'+suffix,[(0,-.18,2.49),(sign*.18,-.16,2.54),(sign*.31,-.22,2.38),(sign*.11,-.265,2.34)],[(0,1,2,3)],white,'chest')
 box('BSR_Suspender.'+suffix,(sign*.255,-.245,2.09),(.068,.035,.52),gray,'chest',.012)
 tube('BSR_BagStrap.'+suffix,[(sign*.32,-.26,1.93),(sign*.35,-.29,2.23),(sign*.33,-.20,2.47),(sign*.32,.05,2.51),(sign*.32,.31,2.34)],[.05]*5,bag,'chest',10)
 box('BSR_Buckle.'+suffix,(sign*.255,-.269,1.90),(.085,.025,.08),sole,'chest',.012)
ell('BSR_Nose',(0,-.445,3.045),(.047,.056,.045),skin,'head')
tube('BSR_Mouth',[(-.095,-.409,2.91),(0,-.432,2.89),(.095,-.409,2.91)],[.012,.014,.012],blush,'head',8)
for i in range(3):ell('BSR_Button_%d'%i,(0,-.253,2.30-i*.14),(.025,.016,.025),white,'chest')
box('BSR_Backpack',(0,.39,2.00),(.70,.36,.82),bag,'chest',.14)
box('BSR_BackpackPocket',(0,.592,1.82),(.54,.08,.34),pink,'chest',.065)
box('BSR_BackpackZip',(0,.64,1.95),(.47,.018,.02),white,'chest',.008)
tube('BSR_BackpackHandle',[(-.10,.39,2.39),(-.08,.39,2.53),(.08,.39,2.53),(.10,.39,2.39)],[.035]*4,bag,'chest',10)
# Scalp dome stops above eyes at front and below ears at back.
v=[];f=[];N=40;K=12
for k in range(K+1):
 for j in range(N):
  a=2*pi*j/N;end=1.47 if sin(a)<0 else 2.15;t=.025+(end-.025)*k/K
  v.append((.575*sin(t)*cos(a),.465*sin(t)*sin(a)+.03,3.16+.61*cos(t)))
for k in range(K):
 for j in range(N):a=k*N+j;d=k*N+(j+1)%N;f.append((a,d,d+N,a+N))
mesh('BSR_Hair_Cap',v,f,hair,'head')
# Flat fringe and long curved locks built as quad ribbons with thickness.
def ribbon(n,centers,widths,m,b):
 v=[];f=[]
 for p,w in zip(centers,widths):
  for q in [-1,-.5,0,.5,1]:v.append((p[0]+q*w,p[1]-.023*(1-q*q),p[2]))
 for k in range(len(centers)-1):
  for j in range(4):a=k*5+j;f.append((a,a+1,a+6,a+5))
 o=mesh(n,v,f,m,b); sol=o.modifiers.new('Hair_Thickness','SOLIDIFY');sol.thickness=.032
 return o
for j in range(7):
 x=(j-3)*.145
 ribbon('BSR_Hair_Bangs_%02d'%j,[(x*.35,-.25,3.70),(x*.75,-.43,3.58),(x,-.48+.18*abs(x),3.39),(x,-.48+.18*abs(x),3.30+.035*(j%2))],[.065,.09,.09,.078],hairhi if j%3==0 else hair,'head')
for j in range(9):
 a=.05+(pi-.10)*j/8;x=.51*cos(a);y=.42*sin(a)
 ribbon('BSR_Hair_Back_%02d'%j,[(x*.85,y,3.52),(x,y+.025,3.12),(x*1.05,y+.09,2.74),(x*1.07,y+.10,2.40),(x*.99,y+.13,2.12)],[.105,.12,.12,.11,.07],hairhi if j%3==0 else hair,'head')
for s in [-1,1]:
 ribbon('BSR_Hair_Side_'+str(s),[(s*.48,-.18,3.5),(s*.53,-.22,3.08),(s*.50,-.23,2.71),(s*.47,-.23,2.46)],[.10,.085,.07,.025],hair,'head')

# Create named humanoid rest skeleton and deterministic weights.
d=bpy.data.armatures.new('BSR_Skeleton');rig=bpy.data.objects.new('BSR_Rig',d);col.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
bones=[('root',(0,0,0),(0,0,.25),None),('pelvis',(0,0,1.70),(0,0,1.88),'root'),('spine',(0,0,1.88),(0,0,2.15),'pelvis'),('chest',(0,0,2.15),(0,0,2.46),'spine'),('neck',(0,0,2.46),(0,0,2.67),'chest'),('head',(0,0,2.67),(0,0,3.55),'neck')]
for s,suf in [(1,'L'),(-1,'R')]:
 bones += [('upper_arm.'+suf,(s*.38,0,2.40),(s*.70,-.015,2.03),'chest'),('forearm.'+suf,(s*.70,-.015,2.03),(s*.93,-.05,1.70),'upper_arm.'+suf),('hand.'+suf,(s*.93,-.05,1.70),(s*1.04,-.065,1.48),'forearm.'+suf),('thigh.'+suf,(s*.21,0,1.77),(s*.21,-.035,1.04),'pelvis'),('shin.'+suf,(s*.21,-.035,1.04),(s*.21,0,.28),'thigh.'+suf),('foot.'+suf,(s*.21,0,.28),(s*.21,-.36,.14),'shin.'+suf)]
for n,h,t,p in bones:
 b=d.edit_bones.new(n);b.head=h;b.tail=t
 if p:b.parent=d.edit_bones[p]
bpy.ops.object.mode_set(mode='OBJECT');rig.show_in_front=True;rig.data.display_type='OCTAHEDRAL';rig.data.bones['root'].use_deform=False;rig.lock_location=(True,True,False);rig.pose.bones['root'].lock_location=(True,True,False)
for o,b in parts:
 o.parent=rig
 if b.startswith(('ARM.','LEG.')):
  suf=b[-1];a,c=('upper_arm.','forearm.') if b.startswith('ARM') else ('thigh.','shin.');ga=o.vertex_groups.new(name=a+suf);gb=o.vertex_groups.new(name=c+suf)
  for v in o.data.vertices:
   z=(o.matrix_world@v.co).z; joint=2.03 if b.startswith('ARM') else 1.04;w=max(0,min(1,(z-joint+.10)/.20));ga.add([v.index],w,'REPLACE');gb.add([v.index],1-w,'REPLACE')
 else:
  g=o.vertex_groups.new(name=b);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
 mod=o.modifiers.new('BSR_Skin','ARMATURE');mod.object=rig

# Packed original reference sheet on front/back/side image empties.
refs=bpy.data.collections.new('BSR_References');scene.collection.children.link(refs)
im=bpy.data.images.load(REF,check_existing=True);im.pack()
for name,loc,rot,offset in [('Front',(-3,1,1.9),(pi/2,0,0),-.125),('Back',(3,1,1.9),(pi/2,0,pi),-.375),('Side',(2,0,1.9),(pi/2,0,pi/2),-.875)]:
 o=bpy.data.objects.new('REF_'+name,None);refs.objects.link(o);o.empty_display_type='IMAGE';o.data=im;o.empty_display_size=5.2;o.location=loc;o.rotation_euler=rot;o.color[3]=.35;o.hide_render=True;o['view_on_sheet']=name;o['note']='Original full turnaround sheet; view-specific orientation, no image modification'
 refs.hide_viewport=True

stage=bpy.data.collections.new('BSR_Studio');scene.collection.children.link(stage)
def camera(name,pos,target,scale):
 d=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,d);stage.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=scale;return o
cam=camera('CAM_Preview',(5,-9,4.5),(0,0,1.9),4.65)
camera('CAM_Front',(0,-10,1.9),(0,0,1.9),4.3);camera('CAM_Back',(0,10,1.9),(0,0,1.9),4.3);camera('CAM_Side',(-10,0,1.9),(0,0,1.9),4.3)
scene.camera=cam
for name,pos,power,size in [('Key',(-3,-4,7),650,5),('Fill',(4,-2,4),400,4),('Rim',(1,4,6),750,3)]:
 d=bpy.data.lights.new('LIGHT_'+name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('LIGHT_'+name,d);stage.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,2))-o.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('BSR_World');scene.world.use_nodes=True;bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.15,.17,.22,1);bg.inputs[1].default_value=.5
scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=900;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.view_settings.view_transform='Standard'
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.color_type='MATERIAL'
scene['README']='BSR schoolgirl v1 / A-pose / front -Y / Z up / FK rig / no animation. References collection can be enabled in Outliner.'
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/BSR_Schoolgirl_Apose_v1.blend')
scene.render.filepath=OUT+'/preview.png';bpy.ops.render.render(write_still=True)
print(json.dumps({'scene':scene.name,'mesh_count':len(parts),'bones':[b.name for b in d.bones] if hasattr(d,'bones') else [b.name for b in rig.data.bones],'faces':sum(len(o.data.polygons) for o,b in parts),'saved':OUT},ensure_ascii=False))
