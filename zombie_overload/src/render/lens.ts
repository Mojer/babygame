import { defaultFilterVert, Filter, GlProgram, UniformGroup } from 'pixi.js';

/**
 * 黑洞重力透鏡：在低解析度世界畫面上做一次全畫面 pass（成本 = 低解析度像素數，不是裝置像素數）。
 * 只鎖 WebGL，所以只寫 GLSL；低品質分級直接關閉。
 */
const fragment = /* glsl */ `
precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
// 與 vertex shader 共用的 uniform 精度必須一致（vertex 預設 highp）
uniform highp vec4 uInputSize;
uniform highp vec4 uOutputFrame;
uniform highp vec4 uInputClamp;
uniform vec4 uHole0;
uniform vec4 uHole1;
uniform vec4 uHole2;
uniform vec4 uHole3;
uniform vec4 uProtect;

vec2 lens(vec2 p, vec4 h) {
  if (h.w <= 0.0) return vec2(0.0);
  vec2 d = p - h.xy;
  float dist = length(d);
  if (dist > h.z || dist < 0.001) return vec2(0.0);
  float t = 1.0 - dist / h.z;
  float k = h.w * t * t;
  // 往外取樣 = 中心被「吸進去」的放大扭曲，加一點旋轉
  float ang = k * 1.6;
  vec2 dir = d / dist;
  vec2 sw = vec2(dir.x * cos(ang) - dir.y * sin(ang), dir.x * sin(ang) + dir.y * cos(ang));
  return sw * (dist + k * h.z * 0.45) - d;
}

void main() {
  vec2 p = vTextureCoord * uInputSize.xy + uOutputFrame.xy;
  vec2 off = lens(p, uHole0) + lens(p, uHole1) + lens(p, uHole2) + lens(p, uHole3);
  // 主角周圍不扭曲（主角在 3/4 風格下和殭屍一起排序，會經過透鏡）
  if (uProtect.z > 0.0) off *= smoothstep(uProtect.z, uProtect.z + 10.0, length(p - uProtect.xy));
  vec2 uv = clamp(vTextureCoord + off * uInputSize.zw, uInputClamp.xy, uInputClamp.zw);
  finalColor = texture(uTexture, uv);
}
`;

export class LensFilter extends Filter {
  constructor() {
    const lensUniforms = new UniformGroup({
      uHole0: { value: new Float32Array(4), type: 'vec4<f32>' },
      uHole1: { value: new Float32Array(4), type: 'vec4<f32>' },
      uHole2: { value: new Float32Array(4), type: 'vec4<f32>' },
      uHole3: { value: new Float32Array(4), type: 'vec4<f32>' },
      uProtect: { value: new Float32Array(4), type: 'vec4<f32>' },
    });
    super({
      glProgram: GlProgram.from({ vertex: defaultFilterVert, fragment, name: 'zo-lens' }),
      resources: { lensUniforms },
    });
  }

  /** 這個圓內不扭曲（主角所在） */
  setProtect(x: number, y: number, r: number) {
    const v = (this.resources.lensUniforms.uniforms as Record<string, Float32Array>).uProtect;
    v[0] = x;
    v[1] = y;
    v[2] = r;
  }

  /** i: 0-3，座標為渲染目標像素；strength 0 = 關閉 */
  setHole(i: number, x: number, y: number, r: number, strength: number) {
    const u = this.resources.lensUniforms.uniforms as Record<string, Float32Array>;
    const v = u[`uHole${i}`];
    v[0] = x;
    v[1] = y;
    v[2] = r;
    v[3] = strength;
  }
}
