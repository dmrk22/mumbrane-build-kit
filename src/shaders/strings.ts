// The string-model membrane (src/lib/art/minimal.ts has the same surface in TS). Each vertex is a
// (u, v) parameter pair; the vertex shader places it on the associate-family surface at angle
// uTheta, turns and tilts it, and projects it. Lines are 1 device pixel and blend additively, so
// where strings crowd together the film glows, like a real string model under a lamp.

export const STRINGS_VERT = `#version 300 es
precision highp float;
in vec2 aParam;
uniform float uTheta;
uniform float uYaw;
uniform float uPitch;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uScale;
uniform float uMode;
out float vDepth;
out float vU;
out float vV;

void main() {
  if (uMode > 0.5) {
    // The muon: aParam is already a clip-space point.
    vDepth = 0.0; vU = 0.0; vV = aParam.x;
    gl_Position = vec4(aParam, 0.0, 1.0);
    return;
  }
  float u = aParam.x;
  // A slow travelling wave through the film: still minimal-looking, never static.
  float v = aParam.y * (1.0 + 0.035 * sin(uTime * 0.6 + u * 2.0));
  float c = cos(uTheta), s = sin(uTheta);
  float sh = sinh(v), ch = cosh(v);
  vec3 p = vec3(c * sh * sin(u) + s * ch * cos(u),
               -c * sh * cos(u) + s * ch * sin(u),
                u * c + v * s);
  float cy = cos(uYaw), sy = sin(uYaw);
  vec3 r = vec3(p.x * cy - p.y * sy, p.x * sy + p.y * cy, p.z);
  float cp = cos(uPitch), sp = sin(uPitch);
  float depth = r.y * cp - r.z * sp;
  float up = r.y * sp + r.z * cp;
  float k = 7.0 / (7.0 + depth);
  vec2 screen = vec2(r.x, up) * k * uScale;
  float aspect = uRes.x / uRes.y;
  gl_Position = vec4(uCenter + vec2(screen.x / aspect, screen.y), 0.0, 1.0);
  vDepth = depth;
  vU = u;
  vV = aParam.y;
}`

export const STRINGS_FRAG = `#version 300 es
precision highp float;
in float vDepth;
in float vU;
in float vV;
uniform float uTime;
uniform float uMode;
uniform float uMuon;
uniform vec3 uChalk;
uniform vec3 uSulfur;
uniform vec3 uVerdigris;
uniform vec3 uSpark;
uniform float uGain;
out vec4 fragColor;

void main() {
  if (uMode > 0.5) {
    // Bright at its head, fading along its tail; uMuon is the event's 0..1 envelope.
    float a = uMuon * smoothstep(-1.0, 1.0, vV);
    fragColor = vec4(uSpark * a, a);
    return;
  }
  // Near strings are brighter; far ones recede into the ground.
  float near = clamp(0.62 - vDepth * 0.16, 0.12, 1.0);
  // A glint that sweeps around the surface, string by string.
  float glint = pow(0.5 + 0.5 * cos(vU * 1.0 - uTime * 0.45), 18.0);
  // Edges of the strip (the two boundary curves) read stronger, like the brass rings of a model.
  float edge = smoothstep(0.82, 1.0, abs(vV) / 1.15);
  vec3 col = mix(uChalk, uVerdigris, 0.35 * (1.0 - near)) ;
  col = mix(col, uSulfur, glint * 0.85);
  float a = (0.16 + 0.55 * edge + 0.6 * glint) * near * uGain;
  fragColor = vec4(col * a, a);
}`
