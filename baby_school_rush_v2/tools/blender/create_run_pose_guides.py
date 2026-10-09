"""Build and render a deterministic side-view run-cycle pose guide in Blender.

Run with:
  blender --background --python tools/blender/create_run_pose_guides.py
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


PROJECT = Path(__file__).resolve().parents[2]
OUTPUT = PROJECT / "public" / "assets" / "character" / "blender-run-guide"
FRAMES = [0, 2, 4, 6, 8, 10, 12, 14]
NAMES = [
    "run_01_contact_l",
    "run_02_down_l",
    "run_03_passing_l",
    "run_04_up_l",
    "run_05_contact_r",
    "run_06_down_r",
    "run_07_passing_r",
    "run_08_up_r",
]


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name: str, color: tuple[float, float, float, float], metallic: float = 0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    mat.node_tree.nodes.clear()
    output = mat.node_tree.nodes.new("ShaderNodeOutputMaterial")
    shader = mat.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
    mat.node_tree.links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = 0.78
    shader.inputs["Metallic"].default_value = metallic
    return mat


def create_segment(name: str, mat, radius: float, depth_y: float):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1, depth=2, location=(0, depth_y, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.rotation_mode = "QUATERNION"
    return obj


def create_joint(name: str, mat, radius: float, depth_y: float):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=(0, depth_y, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.scale = (radius, radius * 0.72, radius)
    return obj


def create_head(name: str, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.scale = (0.23, 0.145, 0.28)
    return obj


def create_nose(mat):
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=0.065, radius2=0.015, depth=0.16)
    obj = bpy.context.object
    obj.name = "facing_marker"
    obj.data.materials.append(mat)
    obj.rotation_mode = "QUATERNION"
    return obj


def set_segment(obj, start: Vector, end: Vector, radius: float, frame: int) -> None:
    direction = end - start
    obj.location = (start + end) * 0.5
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    obj.scale = (radius, radius, direction.length * 0.5)
    obj.keyframe_insert("location", frame=frame)
    obj.keyframe_insert("rotation_quaternion", frame=frame)
    obj.keyframe_insert("scale", frame=frame)


def set_point(obj, point: Vector, frame: int) -> None:
    obj.location = point
    obj.keyframe_insert("location", frame=frame)


def vec(x: float, y: float, z: float) -> Vector:
    return Vector((x, y, z))


def leg_pose(phase: int):
    """Return leading and trailing leg joint coordinates for four run phases."""
    if phase == 0:  # contact
        lead = ((0.00, 1.18), (0.34, 0.72), (0.64, 0.13), (0.83, 0.09))
        trail = ((0.00, 1.18), (-0.29, 0.76), (-0.56, 0.19), (-0.43, 0.09))
    elif phase == 1:  # down
        lead = ((0.00, 1.08), (0.27, 0.61), (0.51, 0.11), (0.72, 0.09))
        trail = ((0.00, 1.08), (-0.07, 0.64), (-0.36, 0.32), (-0.49, 0.17))
    elif phase == 2:  # passing
        lead = ((0.00, 1.18), (-0.12, 0.69), (-0.17, 0.12), (0.03, 0.09))
        trail = ((0.00, 1.18), (0.07, 0.72), (-0.23, 0.44), (-0.34, 0.23))
    else:  # up
        lead = ((0.00, 1.25), (-0.31, 0.79), (-0.41, 0.20), (-0.20, 0.09))
        trail = ((0.00, 1.25), (0.34, 0.84), (0.08, 0.55), (-0.04, 0.37))
    return lead, trail


def arm_pose(phase: int):
    """Opposed bent-arm poses. Return backward arm and forward arm chains."""
    strength = [1.0, 0.72, 0.20, 0.78][phase]
    backward = ((0.08, 1.64), (-0.24 * strength, 1.39), (-0.43 * strength, 1.56))
    forward = ((0.08, 1.64), (0.25 * strength, 1.38), (0.46 * strength, 1.55))
    return backward, forward


def chain(points, y):
    return [vec(x, y, z) for x, z in points]


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    clear_scene()

    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = 16
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 18
    scene.view_settings.look = "AgX - Medium High Contrast"

    world = bpy.data.worlds.new("PoseGuideWorld") if not bpy.data.worlds else bpy.data.worlds[0]
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.055, 0.072, 0.07, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8

    mats = {
        "body": material("body_cream", (0.94, 0.72, 0.55, 1)),
        "torso": material("torso_rose", (0.75, 0.16, 0.29, 1)),
        "near": material("near_aqua", (0.22, 0.78, 0.72, 1)),
        "far": material("far_teal", (0.10, 0.33, 0.31, 1)),
        "joint": material("joint_acid", (0.82, 0.95, 0.45, 1)),
        "ground": material("ground_line", (0.88, 0.93, 0.72, 1)),
        "root": material("root_marker", (0.94, 0.34, 0.48, 1)),
    }

    # Renderable mannequin parts. Smaller Y is closer to the camera.
    parts = {
        "torso": create_segment("torso", mats["torso"], 0.18, 0.0),
        "neck": create_segment("neck", mats["body"], 0.08, -0.005),
        "upper_near": create_segment("upper_arm_near", mats["near"], 0.075, -0.10),
        "lower_near": create_segment("forearm_near", mats["near"], 0.063, -0.10),
        "upper_far": create_segment("upper_arm_far", mats["far"], 0.075, 0.10),
        "lower_far": create_segment("forearm_far", mats["far"], 0.063, 0.10),
        "thigh_near": create_segment("thigh_near", mats["near"], 0.095, -0.08),
        "calf_near": create_segment("calf_near", mats["near"], 0.078, -0.08),
        "foot_near": create_segment("foot_near", mats["near"], 0.065, -0.08),
        "thigh_far": create_segment("thigh_far", mats["far"], 0.095, 0.08),
        "calf_far": create_segment("calf_far", mats["far"], 0.078, 0.08),
        "foot_far": create_segment("foot_far", mats["far"], 0.065, 0.08),
    }

    joint_names = [
        "pelvis", "chest", "shoulder_near", "elbow_near", "hand_near",
        "shoulder_far", "elbow_far", "hand_far", "hip_near", "knee_near",
        "ankle_near", "hip_far", "knee_far", "ankle_far",
    ]
    joints = {name: create_joint(name, mats["joint"], 0.07 if "hand" not in name else 0.06, -0.13) for name in joint_names}
    head = create_head("head", mats["body"])
    nose = create_nose(mats["root"])
    root_marker = create_joint("root_fixed_x", mats["root"], 0.055, -0.15)

    # Static ground line. Thin cylinder laid along X.
    ground = create_segment("ground_line", mats["ground"], 0.012, 0.18)
    set_segment(ground, vec(-1.18, 0.18, 0.04), vec(1.18, 0.18, 0.04), 0.012, 0)

    for index, frame in enumerate(FRAMES + [16]):
        source_index = 0 if frame == 16 else index
        phase = source_index % 4
        opposite = source_index >= 4
        leading, trailing = leg_pose(phase)
        back_arm, front_arm = arm_pose(phase)

        # Opposite half swaps near/far limbs while keeping camera and Root fixed.
        near_leg, far_leg = (trailing, leading) if opposite else (leading, trailing)
        near_arm, far_arm = (front_arm, back_arm) if opposite else (back_arm, front_arm)
        ln = chain(near_leg, -0.08)
        lf = chain(far_leg, 0.08)
        an = chain(near_arm, -0.10)
        af = chain(far_arm, 0.10)

        pelvis = ln[0]
        chest = vec(0.10, 0.0, pelvis.z + 0.49)
        neck_top = vec(0.145, -0.005, pelvis.z + 0.70)
        head_pos = vec(0.185, -0.012, pelvis.z + 0.91)

        set_segment(parts["torso"], pelvis, chest, 0.18, frame)
        set_segment(parts["neck"], chest, neck_top, 0.08, frame)
        set_segment(parts["upper_near"], an[0], an[1], 0.075, frame)
        set_segment(parts["lower_near"], an[1], an[2], 0.063, frame)
        set_segment(parts["upper_far"], af[0], af[1], 0.075, frame)
        set_segment(parts["lower_far"], af[1], af[2], 0.063, frame)
        set_segment(parts["thigh_near"], ln[0], ln[1], 0.095, frame)
        set_segment(parts["calf_near"], ln[1], ln[2], 0.078, frame)
        set_segment(parts["foot_near"], ln[2], ln[3], 0.065, frame)
        set_segment(parts["thigh_far"], lf[0], lf[1], 0.095, frame)
        set_segment(parts["calf_far"], lf[1], lf[2], 0.078, frame)
        set_segment(parts["foot_far"], lf[2], lf[3], 0.065, frame)

        point_map = {
            "pelvis": pelvis, "chest": chest,
            "shoulder_near": an[0], "elbow_near": an[1], "hand_near": an[2],
            "shoulder_far": af[0], "elbow_far": af[1], "hand_far": af[2],
            "hip_near": ln[0], "knee_near": ln[1], "ankle_near": ln[2],
            "hip_far": lf[0], "knee_far": lf[1], "ankle_far": lf[2],
        }
        for name, point in point_map.items():
            set_point(joints[name], point, frame)
        set_point(head, head_pos, frame)
        set_point(root_marker, vec(0, -0.15, pelvis.z), frame)

        nose.location = head_pos + vec(0.255, -0.005, 0.015)
        nose.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(Vector((1, 0, 0)))
        nose.keyframe_insert("location", frame=frame)
        nose.keyframe_insert("rotation_quaternion", frame=frame)

    bpy.ops.object.light_add(type="AREA", location=(-2.5, -4.5, 5.5))
    key = bpy.context.object
    key.name = "Key_Light"
    key.data.energy = 850
    key.data.shape = "DISK"
    key.data.size = 5.0
    key.rotation_euler = (math.radians(25), 0, math.radians(-20))
    bpy.ops.object.light_add(type="AREA", location=(3.5, -2.5, 2.5))
    fill = bpy.context.object
    fill.name = "Fill_Light"
    fill.data.energy = 500
    fill.data.size = 4.0

    bpy.ops.object.camera_add(location=(0, -9.0, 1.25))
    camera = bpy.context.object
    camera.name = "Side_Orthographic_Camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 2.85
    camera.rotation_euler = (math.radians(90), 0, 0)
    direction = vec(0, 0, 1.25) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera

    # Save the editable source before rendering.
    blend_path = OUTPUT / "schoolgirl_run_pose_guide_v1.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

    for frame, name in zip(FRAMES, NAMES):
        scene.frame_set(frame)
        scene.render.filepath = str(OUTPUT / f"{name}.png")
        bpy.ops.render.render(write_still=True)

    scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    print(f"POSE_GUIDE_OUTPUT={OUTPUT}")


if __name__ == "__main__":
    main()
