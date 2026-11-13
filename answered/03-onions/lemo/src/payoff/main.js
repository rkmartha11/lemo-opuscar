// payoff.mp4 — 8 s: the half-cut onion at rest. One tear drop falls in slow motion past the camera and lands beside it with a soft splash. Slow orbit.
import * as THREE from 'three';
import { clamp, seg, eio, ss, eo, lerp, mulberry } from '/core/lib.js';
import { makeStage, buildStudio, buildBoard, buildOnion, YC, onionR, ACCENT, contactShadow } from '../scene.js';

const DUR = 8;
const { renderer, scene, camera, post } = makeStage({ ssaa: +(new URLSearchParams(location.search).get('ssaa') || 2) });
const lights = await buildStudio(scene); lights.rim.castShadow = false; lights.rim.intensity = 2200;
buildBoard(scene);
const { A, B } = buildOnion(scene);

// half A lies on its back, cut face up and turned toward the orbit; half B rests cut-face-down behind it
function restOnBoard(h) {
  h.position.y = 0; h.updateMatrixWorld(true);
  const pa = h.children[0].geometry.attributes.position, v = new THREE.Vector3(); let mn = Infinity;
  for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); if (v.x * h.userData.side < -1e-3) continue; v.x = Math.max(0, v.x * h.userData.side) * h.userData.side; v.applyMatrix4(h.matrixWorld); mn = Math.min(mn, v.y); }
  h.position.y = -mn; h.userData.syncClip();
}
A.rotation.set(0, -.5, -Math.PI / 2 + .22, 'YXZ'); A.position.set(1.0, 0, 1.0); restOnBoard(A);
B.rotation.set(0, 1.1, -Math.PI / 2, 'YXZ'); B.position.set(-8.5, 0, -7.5); restOnBoard(B);
contactShadow(scene, 4.0, 2.7, 2.2, 1.6, .7, .5); contactShadow(scene, 2.2, 1.6, 5.2, 3.8, .35, .5);
contactShadow(scene, -8.5, -7.5, 5.6, 4.6, .55, 1.1);

// ——— water material ———
const water = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: .02, transmission: 1, thickness: .8, ior: 1.333,
  attenuationColor: new THREE.Color('#c9b0ff'), attenuationDistance: 2.2, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.6, iridescence: .25, iridescenceIOR: 1.3 });

// tear drop: lathe, point up, unit-ish size (radius 1 at the bulb)
function tearGeo() {
  const pts = [], n = 64;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * i / n;                                 // 0 bottom → π top
    const r = Math.sin(a) * Math.pow((1 + Math.cos(a)) / 2, .55) * 1.05 + 1e-4;
    const y = -Math.cos(a) * 1.0 + (a > Math.PI / 2 ? Math.pow((a - Math.PI / 2) / (Math.PI / 2), 1.6) * 1.15 : 0);
    pts.push(new THREE.Vector2(Math.max(1e-4, r), y));
  }
  return new THREE.LatheGeometry(pts, 64);
}
const drop = new THREE.Mesh(tearGeo(), water); drop.castShadow = true; scene.add(drop);
const DS = .8;   // drop bulb radius (cm)

// landing spot: on the board, in front-right of the cut face
const LAND = new THREE.Vector3(7.6, 0, 8.6);
const TL = 5.0;   // landing time

// splash: crown droplets + crown sheet + spreading puddle + wet darkening
const R = mulberry(9);
const NS = 18, crumbs = [];
for (let i = 0; i < NS; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), water);
  const a = (i / NS) * Math.PI * 2 + (R() - .5) * .35, sp = 2.8 + R() * 2.6, up = 3.8 + R() * 3, sz = .09 + R() * .13;
  m.userData = { a, sp, up, sz, d: R() * .12 }; m.visible = false; scene.add(m); crumbs.push(m);
}
function crownGeo() {
  const pts = [];
  for (let i = 0; i <= 24; i++) { const v = i / 24; pts.push(new THREE.Vector2(1 + .22 * v * v, v)); }
  for (let i = 24; i >= 0; i--) { const v = i / 24; pts.push(new THREE.Vector2(.975 + .22 * v * v - .02 * (1 - v), v)); }
  return new THREE.LatheGeometry(pts, 96);
}
const crown = new THREE.Mesh(crownGeo(), water); crown.visible = false; scene.add(crown);
// puddle: flat lens, ripples drawn in the normal
const puddleMat = water.clone(); puddleMat.userData.uR = { value: 0 }; puddleMat.userData.uT = { value: 0 };
puddleMat.onBeforeCompile = sh => {
  sh.uniforms.uR = puddleMat.userData.uR; sh.uniforms.uT = puddleMat.userData.uT;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
    varying vec3 vLoc; uniform float uR, uT;
    vec3 pN(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float fd){ vec3 sx = normalize(dFdx(surf_pos)), sy = normalize(dFdy(surf_pos)); vec3 R1 = cross(sy, surf_norm), R2 = cross(surf_norm, sx); float det = dot(sx, R1) * fd; vec3 g = sign(det) * (dHdxy.x * R1 + dHdxy.y * R2); return normalize(abs(det) * surf_norm - g); }`)
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      float rr = length(vLoc.xz);
      float hh = 0.; for (int k = 0; k < 3; k++){ float c = uT * (1.6 + float(k) * .9) - float(k) * .25; hh += exp(-pow((rr - c) / .14, 2.)) * exp(-uT * .9) * (1. - float(k) * .25); }
      normal = pN(-vViewPosition, normal, vec2(dFdx(hh), dFdy(hh)) * 1.4, faceDirection);`);
};
const puddle = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2), puddleMat); puddle.visible = false; scene.add(puddle);
const wet = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshPhysicalMaterial({ color: '#000000', transparent: true, opacity: 0, roughness: .05, clearcoat: 1, depthWrite: false }));
wet.rotation.x = -Math.PI / 2; wet.position.copy(LAND).setY(.012); scene.add(wet);

// ——— camera orbit ———
const CEN = new THREE.Vector3(1.6, 2.6, 2.6);
function camAt(t) {
  const k = t / DUR, az = lerp(-.15, .75, k), dist = lerp(74, 66, eio(k)), h = lerp(40, 33, k) + Math.sin(t * .7) * .3;
  return new THREE.Vector3(CEN.x + Math.sin(az) * dist, h, CEN.z + Math.cos(az) * dist);
}
// drop path: starts above-in-front of the lens, passes close to the camera, lands at LAND (slow motion, gentle gravity)
const T0 = 0.9;
// a tear from the lens: starts just in front of and above the camera, falls on a slow ballistic arc to the board
const startAt = t => { const c = camAt(t), f = CEN.clone().sub(c).normalize(); const right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  return c.clone().add(f.multiplyScalar(11)).add(new THREE.Vector3(0, 1.6, 0)).add(right.multiplyScalar(.5)); };
function dropPos(t) {
  const u = clamp((t - T0) / (TL - T0));
  const ps = startAt(Math.min(t, T0 + 1.2));
  const h = 1 - Math.pow(1 - u, 1.25);
  const p = new THREE.Vector3().lerpVectors(ps, LAND, h);
  const y0 = ps.y, y1 = LAND.y + DS * .98, v0 = .2 * (y1 - y0);
  p.y = y0 + v0 * u + (y1 - y0 - v0) * u * u;
  return p;
}

function render(t) {
  const cam = camAt(t);
  camera.position.copy(cam); camera.lookAt(CEN); camera.fov = 24; camera.updateProjectionMatrix();
  // drop
  const fall = t >= T0 - .2 && t < TL;
  drop.visible = fall;
  let dDist = cam.distanceTo(CEN);
  if (fall) {
    const p = dropPos(t), p2 = dropPos(t + .02), v = p2.clone().sub(p);
    drop.position.copy(p);
    // stretch along the velocity, wobble (slow-mo surface tension)
    const wob = Math.sin(t * 11) * .05;
    drop.scale.set(DS * (1 - wob), DS * (1.05 + wob * 1.4), DS * (1 - wob));
    const up = v.clone().normalize().negate(); drop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up.lengthSq() ? up : new THREE.Vector3(0, 1, 0));
    drop.rotateY(t * .6);
    dDist = cam.distanceTo(p);
  }
  // splash
  const st = t - TL;
  for (const m of crumbs) {
    const { a, sp, up, sz, d } = m.userData, tt = st - d;
    if (tt <= 0 || tt > 2.2) { m.visible = false; continue; }
    m.visible = true;
    const g = 4.2, y = up * tt - .5 * g * tt * tt * 2.2;
    if (y < 0 && tt > .1) { m.visible = false; continue; }
    const rr = .7 + sp * tt * (1 - tt * .18);
    m.position.set(LAND.x + Math.cos(a) * rr, Math.max(0, y) + .25, LAND.z + Math.sin(a) * rr);
    const s = sz * (1 - ss(seg(tt, 1.2, 2.2)) * .6); m.scale.set(s, s * 1.25, s);
  }
  if (st > 0 && st < 1.6) {
    crown.visible = true; const k = st / 1.6;
    const rad = .7 + 2.0 * eo(k), hh = 1.7 * Math.sin(Math.min(1, k * 1.25) * Math.PI) * (1 - k * .5);
    crown.scale.set(rad, Math.max(.01, hh), rad); crown.position.copy(LAND);
  } else crown.visible = false;
  if (st > 0) {
    puddle.visible = true; const k = eo(seg(st, 0, 1.3));
    const pr = .7 + 2.3 * k; puddle.scale.set(pr, lerp(.4, .07, k), pr * (1 - .04 * Math.sin(st * 3))); puddle.position.copy(LAND);
    puddleMat.userData.uT.value = st;
    wet.material.opacity = .14 * ss(seg(st, .1, 1.2)); const wr = .6 + 2.2 * k; wet.scale.set(wr, wr, 1);
  } else { puddle.visible = false; wet.material.opacity = 0; }
  // focus: on the onion, racks to the drop as it passes the lens, back to the landing
  const w = fall ? Math.pow(1 - Math.abs(seg(t, T0, TL) - .38) / .38, 1) : 0;
  const focus = lerp(cam.distanceTo(LAND.clone().lerp(CEN, .3)), dDist, clamp(w * .9));
  post.dof.focus = focus; post.dof.aper = 26; post.dof.maxCoc = 16;
  post.composer.render();
}
render(0);
window.render = render; window.DUR = DUR; window.DBG = { scene, camera, post, A, B, drop };
window.READY = true;
