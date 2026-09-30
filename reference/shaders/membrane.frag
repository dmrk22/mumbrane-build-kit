#version 300 es
precision highp float;
// Mumbrane — "Membrane" hero field.
// A ribbon of field lines with a half-twist (a Möbius band seen edge-on), drifting slowly,
// pierced by muon tracks that leave ripples where they cross. Deterministic for a given (uTime, uSeed).
uniform vec2  uRes;      // drawing-buffer size (px)
uniform float uTime;     // seconds (host freezes it for prefers-reduced-motion)
uniform float uSeed;     // any float; changes the composition
uniform vec2  uPointer;  // 0..1 (y up); (-1,-1) = no pointer
uniform float uDpr;      // device pixel ratio used for the backing store
uniform vec3  uBgA;      // ultramarine
uniform vec3  uBgB;      // ultramarine-deep
uniform vec3  uLine;     // cherenkov
uniform vec3  uSpark;    // vermilion
uniform vec3  uWarm;     // cadmium
out vec4 outColor;

float hash11(float p){ p = fract(p*.1031); p *= p+33.33; p *= p+p; return fract(p); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x), mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p=p*2.03+vec2(11.7,5.3); a*=.5; } return s; }

float centerY(float x, float t){
  return -0.03 + 0.070*sin(x*1.35 + t*0.35 + uSeed) + 0.030*sin(x*2.9 - t*0.22 + uSeed*1.7)
         + 0.06*(fbm(vec2(x*0.7 + t*0.04, uSeed)) - 0.5);
}
float halfWidth(float x, float t){ return 0.15*cos(x*1.05 - t*0.16 + 0.8 + uSeed*0.3); }

const int TRACKS = 6;
void trackParams(int k, float t, float aspect, out vec2 a, out vec2 d, out float age, out float spark){
  float fk = float(k);
  float period = 4.5 + 3.5*hash11(fk*7.3 + uSeed);
  float ph = hash11(fk*3.1 + uSeed*0.13) * period;
  float cyc = floor((t + ph)/period);
  age = mod(t + ph, period);
  float r1 = hash12(vec2(cyc, fk + uSeed)), r2 = hash12(vec2(fk, cyc*1.7 + uSeed));
  float ang = radians(60.0 + 24.0*r2);
  float sx = hash11(cyc*5.1 + fk + uSeed) > 0.5 ? 1.0 : -1.0;
  d = normalize(vec2(sx*cos(ang), -sin(ang)));
  a = vec2((r1 - 0.5)*aspect*1.15, 0.62);
  spark = step(0.80, hash12(vec2(cyc*2.3, fk*9.1 + uSeed)));
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5)*aspect, uv.y - 0.5);
  float t = uTime;
  float px = 1.0 / uRes.y;

  float r = length(p - vec2(0.30*aspect, 0.24));
  vec3 col = mix(uBgA, uBgB, smoothstep(0.0, 1.15, r));

  float bump = 0.0, flash = 0.0;
  vec3 trackCol = vec3(0.0);
  for (int k = 0; k < TRACKS; k++){
    vec2 a, d; float age, spark;
    trackParams(k, t, aspect, a, d, age, spark);
    float speed = 2.2;
    float travel = age * speed;
    vec2 ap = p - a; float s = clamp(dot(ap, d), 0.0, travel);
    float dist = length(ap - d*s);
    // streak: bright near the moving head, then a residual track that lingers (bubble-chamber memory)
    float streak = exp(-(travel - s)*0.9) * exp(-age*0.5);
    float residual = 0.22 * exp(-age*0.45);
    float w = (spark > 0.5 ? 1.3 : 0.8) * px * uDpr;
    float line = (1.0 - smoothstep(0.0, w*1.6, dist)) * (streak + residual);
    float glow = exp(-dist/(px*uDpr*6.0)) * streak * 0.18;
    trackCol += mix(uLine, uSpark, spark) * (line * (spark > 0.5 ? 1.1 : 0.6) + glow);
    float si = a.y / -d.y;
    for (int j = 0; j < 3; j++){ float x = a.x + d.x*si; si = (a.y - centerY(x, t)) / -d.y; }
    float since = age - si/speed;
    if (since > 0.0){
      vec2 ip = a + d*si;
      float dd = length((p - ip) * vec2(1.0, 1.7));
      bump += sin(dd*58.0 - since*8.5) * exp(-dd*8.0) * exp(-since*1.1) * 0.011 * (1.0 + spark);
      flash += exp(-dd*38.0) * exp(-since*3.2) * (0.5 + spark);
    }
  }
  if (uPointer.x >= 0.0){
    vec2 pp = vec2((uPointer.x - 0.5)*aspect, uPointer.y - 0.5);
    float dp = length(p - pp);
    bump += 0.02 * exp(-dp*dp*16.0);
  }

  float c = centerY(p.x, t) + bump;
  float hw = halfWidth(p.x, t);
  float ahw = max(abs(hw), 0.0035);
  float phi = (p.y - c) / ahw;
  float inside = 1.0 - smoothstep(0.97, 1.03, abs(phi));

  float N = 24.0;
  float v = phi * N * 0.5;
  float fw = max(fwidth(v), 1e-4);
  float dLine = abs(fract(v) - 0.5) / fw;
  float lineW = 0.55 * uDpr;
  float lines = 1.0 - smoothstep(lineW*0.5, lineW*0.5 + 1.0, dLine);
  float density = clamp(1.0/(fw*2.2), 0.0, 1.0);
  float edgeFade = 0.30 + 0.70*(1.0 - phi*phi);
  vec3 face = mix(uLine, mix(uLine, vec3(1.0), 0.30), step(0.0, hw));
  col += face * lines * inside * edgeFade * (0.16 + 0.46*density);

  float efw = max(fwidth(phi), 1e-4);
  float edge = 1.0 - smoothstep(0.0, 1.4, abs(abs(phi) - 1.0)/efw);
  col += uLine * edge * 0.30;
  col += uLine * inside * smoothstep(0.045, 0.0, abs(hw)) * 0.08;
  col += uLine * 0.03 * exp(-abs(p.y - c)*9.0);

  col += trackCol;
  col += uWarm * flash * 0.22;
  col += (hash12(gl_FragCoord.xy + fract(t)*97.0) - 0.5) * 0.02;
  outColor = vec4(col, 1.0);
}
