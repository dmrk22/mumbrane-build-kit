#version 300 es
precision highp float;
// Mumbrane "Plein-air" scene pass. Paints a procedural landscape (flat colour, no brushwork yet)
// into a low-resolution target that the paint pass turns into strokes.
// uScene: 0 = cobalt range, 1 = cumulus sky, 2 = meadow, 3 = sea at dusk
uniform vec2  uRes;
uniform float uSeed;
uniform float uScene;
uniform float uTime;
uniform vec3  uSkyTop, uSkyLow, uCloud, uFar, uMid, uNear, uGround, uAccent, uAccent2;
out vec4 o;

float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2  h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h12(i),h12(i+vec2(1,0)),u.x), mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<6;i++){ s+=a*vn(p); p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(3.1,1.7); a*=.5; } return s; }
float ridge(vec2 p){ float s=0., a=.55; for(int i=0;i<6;i++){ float n=1.-abs(vn(p)*2.-1.); s+=a*n*n; p=mat2(1.7,1.1,-1.1,1.7)*p+vec2(5.2,1.3); a*=.48; } return s; }
float cell(vec2 p, out float id){ vec2 i=floor(p), f=fract(p); float md=8.; id=0.;
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 g=vec2(x,y); vec2 r=g+h22(i+g)-f; float d=dot(r,r); if(d<md){md=d; id=h12(i+g);} } return sqrt(md); }

vec3 skyCol(vec2 uv, float cloudiness){
  vec3 c = mix(uSkyLow, uSkyTop, smoothstep(0.30, 1.05, uv.y));
  vec2 q = uv*vec2(2.6, 5.2) + vec2(uSeed*3.1, 0.0);
  vec2 w = vec2(fbm(q + vec2(1.7, 9.2)), fbm(q + vec2(8.3, 2.8)));
  float n = fbm(q + 1.9*w + vec2(uTime*0.012, 0.0));
  float cl = smoothstep(0.55 - 0.25*cloudiness, 0.82, n) * smoothstep(0.30, 0.62, uv.y);
  float lit = smoothstep(0.35, 0.9, fbm(q*1.7 + w*2.3 + 4.0));
  vec3 cloud = mix(uCloud*0.82, uCloud, lit);
  return mix(c, cloud, cl*0.92);
}
float range(float x, float base, float amp, float freq, float s){ return base + amp*ridge(vec2(x*freq + s, s*0.37)); }

float bump(float x, float c, float w){ float d = (x - c) / w; return exp(-d*d); }
float farH(float x){
  float a = 0.28 + 0.16*h12(vec2(uSeed, 1.0)), b = 0.68 + 0.16*h12(vec2(uSeed, 2.0));
  return 0.34 + 0.30*bump(x, a, 0.17) + 0.20*bump(x, b, 0.12) + 0.06*ridge(vec2(x*3.1 + uSeed, 4.1)) - 0.03;
}
float midH(float x){
  float a = 0.12 + 0.2*h12(vec2(uSeed, 3.0)), b = 0.55 + 0.3*h12(vec2(uSeed, 4.0));
  return 0.20 + 0.13*bump(x, a, 0.22) + 0.16*bump(x, b, 0.18) + 0.045*ridge(vec2(x*4.3 + uSeed*1.7, 2.2));
}
vec3 scene0(vec2 uv){ // cobalt range (cadmium sky, ultramarine mountains, dark trees)
  vec3 c = skyCol(uv, 0.35);
  vec3 haze = mix(uSkyLow, vec3(0.78, 0.84, 0.98), 0.80);
  float e = 0.003;
  float far = farH(uv.x);
  if (uv.y < far){
    float sl = (farH(uv.x + e) - farH(uv.x - e)) / (2.0*e);
    float light = clamp(0.5 - 0.25*sl, 0.0, 1.0);          // light from the left
    c = mix(uFar*0.80, mix(uFar, haze, 0.35), light);
    c = mix(c, haze, 0.18*smoothstep(far - 0.25, far, uv.y));
    c *= 0.95 + 0.1*fbm(uv*vec2(7.0, 16.0) + uSeed);
  }
  float mid = midH(uv.x);
  if (uv.y < mid){
    float sl = (midH(uv.x + e) - midH(uv.x - e)) / (2.0*e);
    float light = clamp(0.5 - 0.35*sl, 0.0, 1.0);
    vec3 shade = uMid * 0.70; vec3 lit = mix(uMid, uFar, 0.45);
    c = mix(shade, lit, light) * (0.92 + 0.16*fbm(uv*vec2(6.0, 14.0) + uSeed));
  }
  float id; float cd = cell(uv*vec2(11.0, 7.0) + vec2(uSeed, 0.0), id);
  float treeLine = 0.13 + 0.08*fbm(vec2(uv.x*5.0, uSeed)) + 0.06*(1.0 - cd)*step(0.35, id);
  if (uv.y < treeLine){
    c = uNear * (0.70 + 0.55*smoothstep(0.85, 0.05, cd)) * (0.85 + 0.3*id);
    c = mix(c, uFar*0.5, 0.12*smoothstep(0.9, 0.2, cd));
  }
  if (uv.y < 0.05 + 0.02*fbm(vec2(uv.x*10.0, 3.0))) c = mix(uGround, uAccent, 0.18*fbm(uv*24.0));
  return c;
}
vec3 scene1(vec2 uv){ // cumulus sky over a dark shore (the 'wing sky' mood, without figures)
  vec3 c = mix(uSkyLow, uSkyTop, smoothstep(0.0, 1.0, uv.y));
  vec2 q = uv*vec2(2.0, 3.2) + vec2(uSeed*2.3, 0.0);
  vec2 w = vec2(fbm(q + vec2(2.1, 4.4)), fbm(q + vec2(6.7, 1.3)));
  float n = fbm(q + 2.2*w);
  float band = smoothstep(0.15, 0.55, uv.y) * smoothstep(1.02, 0.55, uv.y);
  float cl = smoothstep(0.50, 0.80, n) * band;
  float lit = smoothstep(0.30, 0.95, fbm(q*1.6 + w*2.1 + 3.0) + 0.25*uv.y);
  c = mix(c, mix(uCloud*0.72, uCloud, lit), cl);
  float shore = 0.16 + 0.05*fbm(vec2(uv.x*4.0, uSeed));
  if (uv.y < shore) c = mix(uGround, uNear, 0.35*fbm(uv*vec2(12.0, 30.0)));
  // a few warm lights on the shore
  float id; float cd = cell(uv*vec2(40.0, 6.0), id);
  if (uv.y < shore && uv.y > shore - 0.05 && id > 0.93) c = mix(c, uAccent, smoothstep(0.25, 0.0, cd));
  return c;
}
vec3 scene2(vec2 uv){ // meadow (lush greens, violet and cadmium flowers)
  vec3 c = skyCol(uv, 0.2);
  float hills = 0.52 + 0.06*fbm(vec2(uv.x*2.0, uSeed));
  if (uv.y < hills){ c = mix(uMid, uSkyLow, 0.35*smoothstep(hills-0.12, hills, uv.y)); c *= 0.9 + 0.2*fbm(uv*vec2(10.0, 25.0)); }
  float wood = 0.40 + 0.07*fbm(vec2(uv.x*5.0, uSeed + 3.0));
  float id; float cd = cell(uv*vec2(22.0, 12.0) + uSeed, id);
  if (uv.y < wood + 0.04*(1.0 - cd)) c = uNear * (0.7 + 0.6*smoothstep(0.9, 0.1, cd)) * (0.85 + 0.3*id);
  float meadow = 0.30 + 0.03*sin(uv.x*6.0 + uSeed);
  if (uv.y < meadow){
    c = uGround * (0.85 + 0.3*fbm(uv*vec2(14.0, 40.0)));
    float fid; float fd = cell(uv*vec2(70.0, 60.0*(1.2 - uv.y)), fid);
    float bloom = smoothstep(0.35, 0.0, fd) * step(0.62, fid) * smoothstep(meadow, 0.0, uv.y);
    c = mix(c, fid > 0.82 ? uAccent : uAccent2, bloom);
  }
  return c;
}
vec3 scene3(vec2 uv){ // sea at dusk (vermilion/cadmium sky, ultramarine water, glint)
  float hz = 0.42;
  vec3 c = mix(uSkyLow, uSkyTop, smoothstep(hz, 1.0, uv.y));
  vec2 q = uv*vec2(2.2, 7.0) + vec2(uSeed, 0.0);
  float n = fbm(q + fbm(q + 3.0)*1.5);
  c = mix(c, uCloud, smoothstep(0.55, 0.85, n) * smoothstep(hz+0.05, hz+0.35, uv.y) * 0.8);
  vec2 sun = vec2(0.66 + 0.1*sin(uSeed), hz + 0.07);
  c = mix(c, uAccent, smoothstep(0.06, 0.0, length((uv - sun)*vec2(1.0, 1.2))));
  if (uv.y < hz){
    float d = hz - uv.y;
    c = mix(uFar, uMid, smoothstep(0.0, 0.35, d));
    float waves = fbm(vec2(uv.x*18.0, uv.y*90.0/(0.3 + d*3.0)) + uSeed);
    c *= 0.85 + 0.3*waves;
    float glint = smoothstep(0.10 + d*0.35, 0.0, abs(uv.x - sun.x)) * smoothstep(0.58, 0.85, waves);
    c = mix(c, uAccent, glint*0.8);
  }
  return c;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 c = uScene < 0.5 ? scene0(uv) : uScene < 1.5 ? scene1(uv) : uScene < 2.5 ? scene2(uv) : scene3(uv);
  o = vec4(c, 1.0);
}
