// hook.mp4 — 5 s: slow-motion knife slices a red onion; faint shimmering vapour rises from the cut toward camera. Slow push-in.
import * as THREE from 'three';
import { clamp, seg, eio, ss, lerp, mulberry } from '/core/lib.js';
import { makeStage, buildStudio, buildBoard, buildOnion, buildKnife, YC, onionR, ACCENT, ONION, contactShadow } from '../scene.js';

const DUR = 5;
const { renderer, scene, camera, post } = makeStage({ ssaa: +(new URLSearchParams(location.search).get('ssaa') || 2) });
await buildStudio(scene);
buildBoard(scene);
const { A, B } = buildOnion(scene);
const knife = buildKnife(); scene.add(knife);
const cs = contactShadow(scene, 0, 0, 3.4, 3.4, .75);
const TOPY = YC + onionR(0) * ONION.SQ;

// ——— vapour: soft lavender wisps + fine glinting mist, closed-form in t ———
const NV = 2600, NG = 140;
function makeVapour() {
  const R = mulberry(77), g = new THREE.BufferGeometry();
  const a0 = [], a1 = [], a2 = [];
  for (let i = 0; i < NV + NG; i++) {
    const glint = i >= NV;
    // birth on the cut seam: along the cut curve (y from low to top), near x = 0
    const th = Math.PI * (.08 + R() * .7), r = onionR(th);
    a0.push((R() - .5) * .6, YC + r * Math.cos(th) * ONION.SQ, (R() < .5 ? -1 : 1) * r * Math.sin(th) * (.3 + .7 * R()));
    a1.push(R() * 4.2 + .9, 2.2 + R() * 2.4, R());                // birth time, life, seed
    a2.push(glint ? 1 : 0, .6 + R() * .8, R() * 6.283);          // kind, size factor, phase
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(a0, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(a1, 3));
  g.setAttribute('aK', new THREE.Float32BufferAttribute(a2, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uCam: { value: new THREE.Vector3() }, uPx: { value: renderer.getPixelRatio() * 1920 }, uCol: { value: ACCENT.clone() }, uAmt: { value: 1 } },
    vertexShader: `
      attribute vec3 aT; attribute vec3 aK; uniform float uT, uPx, uAmt; uniform vec3 uCam;
      varying float vA; varying float vKind; varying float vTw; varying float vSeed;
      void main(){
        float age = uT - aT.x; float life = aT.y; float k = age / life;
        vec3 p = position;
        if (age < 0. || k > 1.) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; vA = 0.; return; }
        vec3 toCam = normalize(uCam - p);
        float s = aT.z * 40.;
        // rise, drift to camera, curl-ish wander
        p.y += age * (1.4 + aK.y * .9) + age * age * .12;
        p += toCam * age * (1.3 + aK.y * .8);
        p.x += sin(age * 1.3 + s) * .5 * age + sin(age * 2.9 + s * 1.7) * .18;
        p.z += cos(age * 1.1 + s * .7) * .45 * age;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        float fade = smoothstep(0., .18, k) * (1. - smoothstep(.55, 1., k));
        vKind = aK.x;
        float size = aK.x > .5 ? (.05 + .04 * aK.y) : (1.3 + 4.2 * k) * aK.y;
        gl_PointSize = size * uPx * .5 / -mv.z;
        vTw = aK.x > .5 ? pow(.5 + .5 * sin(uT * 9. + aK.z * 13.), 6.) : 1.;
        vA = fade * uAmt * (aK.x > .5 ? .9 : .02); vSeed = aT.z;
      }`,
    fragmentShader: `
      uniform vec3 uCol; uniform float uT; varying float vA; varying float vKind; varying float vTw; varying float vSeed;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        vec2 d = gl_PointCoord - .5; float r = length(d) * 2.;
        float a;
        if (vKind > .5) { a = exp(-r * r * 9.) + .5 * exp(-abs(d.x) * 60.) * exp(-abs(d.y) * 6.) * vTw + .5 * exp(-abs(d.y) * 60.) * exp(-abs(d.x) * 6.) * vTw; a *= .4 + .9 * vTw; }
        else { vec2 q = gl_PointCoord * 1.8 + vSeed * 17.; float w = vn(q * .6 + vec2(0., uT * .5)) * .65 + vn(q * 1.4 - uT * .3) * .35;
          a = exp(-r * r * 2.6) * smoothstep(.2, .9, w) * 1.6; }
        if (a < .002) discard;
        vec3 c = vKind > .5 ? mix(vec3(1.), uCol, .25) * 2.2 : mix(vec3(.92, .9, 1.), uCol, .45);
        gl_FragColor = vec4(c * a * vA, 1.);
      }`
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 10;
  return pts;
}
const vapour = makeVapour(); scene.add(vapour);

// ——— animation ———
// knife: edge from above the neck down to the board, in slow motion, drawing slightly back toward the tip
const KZ = 7.5;  // knife local z at the onion axis is -KZ (blade belly over the onion)
function render(t) {
  // cut progress: 0 edge touching the neck, 1 edge on the board
  const cl = seg(t, .3, 3.6), c = cl * .55 + ss(cl) * .45;
  const ey = lerp(TOPY + 1.2, -.05, c) + (t < .35 ? (1 - t / .35) * 1.4 : 0);
  knife.position.set(0, ey, -KZ + lerp(-1.4, 1.6, c));
  knife.rotation.set(lerp(-.05, .02, c), Math.PI, 0);
  // wedge apart by the blade, then halves part and settle
  const wedge = .05 * ss(seg(c, .85, 1));
  const part = ss(seg(t, 3.3, 4.9));
  const lift = ss(seg(t, 3.9, 5.0));
  knife.position.y += lift * 1.2; knife.position.x = 0;
  for (const [h, s] of [[A, 1], [B, -1]]) {
    h.position.set(s * (wedge + part * .55), 0, 0);
    h.rotation.set(0, 0, -s * part * .16);          // roll outward over the bottom edge
    h.position.y = part * .25;
    h.userData.syncClip();
  }
  cs.scale.set(6.8 + part * 1.2, 6.8, 1);
  // camera: slow push-in with drift (never still)
  const k = t / DUR, e = eio(k) * .75 + k * .25;
  const az = lerp(1.02, .9, e), dist = lerp(84, 62, e), hgt = lerp(30, 21, e);
  camera.position.set(Math.sin(az) * dist, hgt + Math.sin(t * .9) * .15, Math.cos(az) * dist);
  const look = new THREE.Vector3(0, lerp(6.4, 5.4, e), 0);
  camera.lookAt(look);
  camera.fov = 24; camera.updateProjectionMatrix();
  post.dof.focus = camera.position.distanceTo(look) - 1.0; post.dof.aper = 60; post.dof.maxCoc = 14;
  vapour.material.uniforms.uT.value = t; vapour.material.uniforms.uCam.value.copy(camera.position);
  vapour.material.uniforms.uAmt.value = ss(seg(t, .9, 2.0));
  post.composer.render();
}
render(0);
window.render = render; window.DUR = DUR; window.DBG = { scene, camera, post, knife, A, B };
window.READY = true;
