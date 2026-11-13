// Shared set for the onion clips: renderer + post, dark studio, walnut board, procedural red onion (two halves + cut faces), chef's knife.
// Units: centimetres. Board top at y = 0. Onion axis = y, cut plane = x = 0.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { makePost } from '/core/three/post.js';
import { mulberry } from '/core/lib.js';

export const W = 1080, H = 1920;
export const BG = new THREE.Color('#16191F');
// background colour fed to the renderer so that, after grade + NeutralToneMapping (which crushes darks), the frame lands on #16191F
export const BG_IN = new THREE.Color().setRGB(.0358 / 1.17, .0375 / 1.17, .0415 / 1.17, THREE.LinearSRGBColorSpace);
export const ACCENT = new THREE.Color('#B388FF');
const PH = '/core/assets/polyhaven/';

// ——— renderer, camera, post ———
export function makeStage({ ssaa = 2 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(ssaa); renderer.setSize(W, H);
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = BG_IN.clone();
  const camera = new THREE.PerspectiveCamera(30, W / H, .5, 600);
  const post = makePost(renderer, scene, camera, W, H, { ssaa, ao: true, aoRadius: 1.2, aoThickness: 1.5, aoAmt: .7 });
  post.bloom.strength = .22; post.bloom.threshold = 1.05; post.bloom.radius = .55;
  const v = post.vig.uniforms; v.amt.value = .0; v.warm.value = 0; v.contrast.value = .18; v.sat.value = 1.05;
  return { renderer, scene, camera, post };
}

// ——— studio: HDRI reflections only, key + rim (brand accent) + softbox ———
export async function buildStudio(scene) {
  const hdr = await new RGBELoader().loadAsync(PH + 'photo_studio_loft_hall_2k.hdr');
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr; scene.environmentIntensity = .32; scene.environmentRotation.y = 2.2;
  scene.fog = new THREE.Fog(BG_IN, 90, 200);

  const key = new THREE.SpotLight('#fff3e6', 2600, 0, .32, .95, 2);
  key.position.set(-26, 52, 30); key.target.position.set(0, 2, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0002; key.shadow.normalBias = .02; key.shadow.radius = 6;
  key.shadow.camera.near = 20; key.shadow.camera.far = 140;
  scene.add(key, key.target);
  const rim = new THREE.SpotLight(ACCENT, 3200, 72, .22, .7, 2);
  rim.position.set(12, 34, -46); rim.target.position.set(0, 5, 0);
  rim.castShadow = true; rim.shadow.mapSize.set(1024, 1024); rim.shadow.bias = -.0003; rim.shadow.radius = 5; rim.shadow.camera.near = 20; rim.shadow.camera.far = 120; scene.add(rim, rim.target);
  const rim2 = new THREE.SpotLight('#d9c8ff', 900, 0, .5, .9, 2);
  rim2.position.set(-34, 20, -30); rim2.target.position.set(0, 4, 0); scene.add(rim2, rim2.target);
  RectAreaLightUniformsLib.init();
  const box = new THREE.RectAreaLight('#ffffff', 2.2, 30, 14); box.position.set(4, 40, 10); box.lookAt(0, 0, 0); scene.add(box);
  scene.add(new THREE.HemisphereLight('#9a96a0', '#0d0e12', .2));
  return { key, rim, rim2, box };
}

// ——— dark walnut board ———
export function buildBoard(scene) {
  const tl = new THREE.TextureLoader();
  const tex = (f, srgb) => { const t = tl.load(PH + f); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.5); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const mat = new THREE.MeshPhysicalMaterial({ map: tex('walnut_diff.jpg', true), normalMap: tex('walnut_nor.jpg'), roughnessMap: tex('walnut_rough.jpg'),
    color: new THREE.Color('#2c221f'), roughness: .78, normalScale: new THREE.Vector2(.6, .6), clearcoat: .25, clearcoatRoughness: .45 });
  const board = new THREE.Mesh(new RoundedBoxGeometry(110, 3.2, 80, 6, 1.2), mat);
  board.position.set(0, -1.6, -4); board.receiveShadow = true; board.castShadow = true;
  scene.add(board);
  return board;
}

// ——— onion shape: polar radius about C (0, YC) as a function of angle from +y ———
export const ONION = { R0: 4.7, NECK: .2, NECKW: .3, FLAT: .1, SQ: .86 };
export function onionR(th) {
  const { R0, NECK, NECKW, FLAT } = ONION;
  return R0 * (1 + NECK * Math.exp(-((th / NECKW) ** 2))) * (1 - FLAT * Math.exp(-(((Math.PI - th) / .6) ** 2)));
}
export const YC = onionR(Math.PI) * ONION.SQ;         // bottom touches y = 0
export const YB = YC - onionR(Math.PI) * ONION.SQ * .72; // root point layers grow from
const GLSL_SHAPE = `
  float onionR(float th){ return ${ONION.R0.toFixed(4)} * (1. + ${ONION.NECK.toFixed(4)} * exp(-pow(th / ${ONION.NECKW.toFixed(4)}, 2.))) * (1. - ${ONION.FLAT.toFixed(4)} * exp(-pow((3.14159265 - th) / .6, 2.))); }
  float onionSdf(vec2 p){ vec2 q = p - vec2(0., ${YC.toFixed(4)}); q.y /= ${ONION.SQ.toFixed(4)}; float r = length(q); float th = atan(abs(q.x), q.y); return r - onionR(th); }
  // distance from the root point to the outer skin along direction d (bisection)
  float rootReach(vec2 d){ float a = 0., b = 16.; for (int i = 0; i < 16; i++){ float m = .5 * (a + b); if (onionSdf(vec2(0., ${YB.toFixed(4)}) + d * m) < 0.) a = m; else b = m; } return .5 * (a + b); }
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
  vec3 perturbN(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection) {
    vec3 vSigmaX = normalize(dFdx(surf_pos.xyz)); vec3 vSigmaY = normalize(dFdy(surf_pos.xyz)); vec3 vN = surf_norm;
    vec3 R1 = cross(vSigmaY, vN); vec3 R2 = cross(vN, vSigmaX); float fDet = dot(vSigmaX, R1) * faceDirection;
    vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2); return normalize(abs(fDet) * surf_norm - vGrad); }
`;

function profilePoints(n = 160) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const th = Math.PI * (1 - i / n), r = onionR(th); pts.push(new THREE.Vector2(Math.max(1e-4, r * Math.sin(th)), YC + r * Math.cos(th) * ONION.SQ)); }
  return pts;
}

// dry red-onion skin, painted on a canvas (u around, v bottom → top)
function skinTextures() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  const rc = document.createElement('canvas'); rc.width = rc.height = S; const gr = rc.getContext('2d');
  const R = mulberry(31);
  g.fillStyle = '#4a1934'; g.fillRect(0, 0, S, S);
  gr.fillStyle = '#9a9a9a'; gr.fillRect(0, 0, S, S);
  // broad colour variation bands along meridians
  for (let i = 0; i < 70; i++) {
    const x = R() * S, w = 8 + R() * 60, hue = R();
    g.fillStyle = hue < .5 ? `rgba(120,40,78,${.25 + R() * .35})` : hue < .8 ? `rgba(70,20,46,${.3 + R() * .4})` : `rgba(160,92,90,${.15 + R() * .25})`;
    g.fillRect(x, 0, w, S); g.fillRect(x - S, 0, w, S);
  }
  // fine veins
  for (let i = 0; i < 520; i++) {
    const x = R() * S, a = .04 + R() * .12, lw = .5 + R() * 1.2, light = R() < .4;
    g.strokeStyle = light ? `rgba(200,140,150,${a})` : `rgba(25,6,16,${a})`; g.lineWidth = lw;
    g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= S; y += 32) g.lineTo(x + Math.sin(y * .01 + i) * 3, y); g.stroke();
    gr.strokeStyle = light ? 'rgba(200,200,200,.12)' : 'rgba(60,60,60,.12)'; gr.lineWidth = lw; gr.beginPath(); gr.moveTo(x, 0); gr.lineTo(x, S); gr.stroke();
  }
  // papery coppery dry patches + glossy fresh patches where outer paper flaked off
  for (let i = 0; i < 26; i++) {
    const x = R() * S, y = S * (.15 + R() * .7), w = 30 + R() * 140, h = 60 + R() * 260, dry = R() < .55;
    const grd = g.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
    grd.addColorStop(0, dry ? 'rgba(176,112,96,.45)' : 'rgba(112,26,82,.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.save(); g.translate(x, y); g.scale(w / Math.max(w, h), h / Math.max(w, h)); g.translate(-x, -y); g.beginPath(); g.arc(x, y, Math.max(w, h), 0, 7); g.fill(); g.restore();
    { const rg = gr.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * .7); rg.addColorStop(0, dry ? 'rgba(235,235,235,.3)' : 'rgba(40,40,40,.35)'); rg.addColorStop(1, 'rgba(128,128,128,0)'); gr.fillStyle = rg; gr.fillRect(x - w * 2, y - h, w * 4, h * 2); }
  }
  // neck + root darkening
  const top = g.createLinearGradient(0, 0, 0, S * .16); top.addColorStop(0, 'rgba(70,40,30,.95)'); top.addColorStop(1, 'rgba(70,40,30,0)');
  g.fillStyle = top; g.fillRect(0, 0, S, S * .16);
  const bot = g.createLinearGradient(0, S, 0, S * .9); bot.addColorStop(0, 'rgba(60,40,30,.95)'); bot.addColorStop(1, 'rgba(60,40,30,0)');
  g.fillStyle = bot; g.fillRect(0, S * .9, S, S * .1);
  const mk = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.flipY = true; return t; };
  return { map: mk(c, true), rough: mk(rc, false) };
}

// cut-face shading: concentric scales grown from the root, magenta epidermis, wet translucent flesh
function cutFaceMaterial(clip) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .22, clearcoat: .7, clearcoatRoughness: .08, sheen: .15, sheenColor: new THREE.Color('#e8d8ff'),
    sheenRoughness: .4, specularIntensity: 1, ior: 1.36, clippingPlanes: clip ? [clip] : null, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  m.userData.uWet = { value: 1 };
  m.onBeforeCompile = sh => {
    sh.uniforms.uWet = m.userData.uWet;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc; uniform float uWet;\n' + GLSL_SHAPE + `
      float layerU(vec2 p){ vec2 d = p - vec2(0., ${YB.toFixed(4)}); float L = length(d); vec2 dir = L > 1e-4 ? d / L : vec2(0., 1.); return L / rootReach(dir); }
      // returns (colour, height)
      vec4 cutShade(vec2 p){
        float s = clamp(layerU(p), 0., 1.2);
        float N = 12.;
        float u = pow(s, .82) * N; float idx = floor(u), f = fract(u);
        float outer = idx / N;
        float n1 = vn(p * 6.), n2 = vn(p * 22. + 7.);
        vec3 flesh = mix(vec3(.84, .79, .86), vec3(.76, .70, .84), n1 * .6 + outer * .3);
        flesh = mix(flesh, vec3(.80, .74, .90), smoothstep(.0, .5, f) * .25);
        float bandW = mix(.08, .2, outer) * (.8 + .4 * vn(vec2(atan(p.x, p.y - ${YB.toFixed(3)}) * 6., idx * 3.)));
        float band = smoothstep(1. - bandW - .06, 1. - bandW, f);
        vec3 mag = mix(vec3(.58, .10, .48), vec3(.42, .05, .38), n2);
        vec3 col = mix(flesh, mag, band * (.55 + .45 * outer));
        float mem = exp(-pow(f / .035, 2.));
        col = mix(col, vec3(.98, .96, 1.), mem * .8);
        float gap = exp(-pow((1. - f) / .018, 2.));
        col *= 1. - gap * .45;
        // core
        float core = 1. - smoothstep(.07, .13, s);
        col = mix(col, vec3(.86, .88, .70), core);
        // dry outer skin rim
        float skin = smoothstep(.965, .99, s);
        col = mix(col, vec3(.30, .08, .18), skin);
        // root plate
        float plate = (1. - smoothstep(.0, .9, length(p - vec2(0., ${YB.toFixed(3)} - .3)))) ;
        col = mix(col, vec3(.86, .82, .70), plate * .7);
        // cells
        float cells = vn(vec2(p.x * 40., (u) * 8.));
        col *= .95 + .08 * cells;
        float h = -gap * .6 - mem * .2 + cells * .08 + n2 * .05;
        // juice beads
        vec2 bc = p * 3.2; vec2 bi = floor(bc), bf = fract(bc) - .5; float bh = h21(bi);
        vec2 off = vec2(h21(bi + 3.), h21(bi + 9.)) - .5; float br = .12 + .2 * h21(bi + 5.);
        float bead = bh > .55 ? smoothstep(br, 0., length(bf - off * .5)) : 0.;
        h += sqrt(max(bead, 0.)) * .9 * uWet;
        return vec4(col, h);
      }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 cp = vec2(abs(vLoc.z), vLoc.y); vec4 cs = cutShade(cp); diffuseColor.rgb *= cs.rgb; float cutH = cs.a;`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        normal = perturbN(-vViewPosition, normal, vec2(dFdx(cutH), dFdy(cutH)) * .9, faceDirection);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * vec3(.05, .04, .06);`);
  };
  return m;
}

// one half of the onion (side = +1 keeps x > 0, side = -1 keeps x < 0), as a Group whose origin is on the board under the onion axis
export function buildOnionHalf(side, skin) {
  const grp = new THREE.Group();
  const plane = new THREE.Plane(new THREE.Vector3(side, 0, 0), 0);  // updated each frame to world space
  const geo = new THREE.LatheGeometry(profilePoints(), 160);
  const mat = new THREE.MeshPhysicalMaterial({ map: skin.map, roughnessMap: skin.rough, bumpMap: skin.rough, bumpScale: .5, roughness: .7,
    sheen: .6, sheenColor: new THREE.Color('#c9849a'), sheenRoughness: .5, clearcoat: .25, clearcoatRoughness: .5, clippingPlanes: [plane], clipShadows: true, side: THREE.FrontSide });
  const shell = new THREE.Mesh(geo, mat); shell.castShadow = true; shell.receiveShadow = true; grp.add(shell);
  // inner wall seen at the very edge of a cut: same skin, back faces, dark
  const inner = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#2a0f1c', roughness: .6, side: THREE.BackSide, clippingPlanes: [plane] })); grp.add(inner);
  // cap
  const pts = profilePoints(200), shape = new THREE.Shape();
  shape.moveTo(0, pts[0].y); for (const p of pts) shape.lineTo(p.x, p.y); for (let i = pts.length - 1; i >= 0; i--) shape.lineTo(-pts[i].x, pts[i].y);
  const capGeo = new THREE.ShapeGeometry(shape, 64);
  capGeo.rotateY(side > 0 ? -Math.PI / 2 : Math.PI / 2);
  const capMat = cutFaceMaterial(null); capMat.envMapIntensity = .55;
  const cap = new THREE.Mesh(capGeo, capMat); cap.receiveShadow = true; cap.castShadow = false; grp.add(cap);
  // dry neck tuft
  const tuft = new THREE.Mesh(new THREE.ConeGeometry(.36, .75, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#5a3a2a', roughness: .9, side: THREE.DoubleSide, clippingPlanes: [plane] }));
  tuft.position.set(0, YC + onionR(0) * ONION.SQ + .2, 0); tuft.rotation.z = .08; tuft.castShadow = true; grp.add(tuft);
  grp.userData = { plane, side, mats: [mat, inner.material, tuft.material], cap, capMat };
  // keep the clip plane at the group's local x = 0, in world space
  grp.userData.syncClip = () => {
    grp.updateMatrixWorld(true);
    const n = new THREE.Vector3(side, 0, 0).transformDirection(grp.matrixWorld), o = new THREE.Vector3().setFromMatrixPosition(grp.matrixWorld);
    plane.setFromNormalAndCoplanarPoint(n, o.add(n.clone().multiplyScalar(-.002)));
  };
  return grp;
}
export function buildOnion(scene) {
  const skin = skinTextures();
  const A = buildOnionHalf(1, skin), B = buildOnionHalf(-1, skin);
  scene.add(A, B);
  return { A, B, skin };
}

// ——— chef's knife: blade in the x = 0 plane, edge at local y = 0, heel at z = 0, tip at z = -L ———
export function buildKnife() {
  const L = 21, NZ = 120, NH = 18, T = .22;
  const spine = zz => 5.2 - 4.0 * Math.pow(zz, 4);
  const edge = zz => 1.2 * Math.pow(Math.max(0, (zz - .55) / .45), 2.1);
  const thick = (zz, h) => T * (1 - .55 * zz) * Math.min(1, Math.pow(h, .7) * 1.25 + .02);
  const pos = [], idx = [];
  const P = (side, i, j) => { const zz = i / NZ, h = j / NH, e = edge(zz), s = spine(zz); return [side * thick(zz, h) / 2, e + h * (s - e), -zz * L]; };
  for (const side of [1, -1]) for (let i = 0; i <= NZ; i++) for (let j = 0; j <= NH; j++) pos.push(...P(side, i, j));
  const id = (s, i, j) => s * (NZ + 1) * (NH + 1) + i * (NH + 1) + j;
  for (let i = 0; i < NZ; i++) for (let j = 0; j < NH; j++) {
    const a = id(0, i, j), b = id(0, i + 1, j), c = id(0, i + 1, j + 1), d = id(0, i, j + 1);
    idx.push(a, d, b, b, d, c);
    const a2 = id(1, i, j), b2 = id(1, i + 1, j), c2 = id(1, i + 1, j + 1), d2 = id(1, i, j + 1);
    idx.push(a2, b2, d2, b2, c2, d2);
  }
  for (let i = 0; i < NZ; i++) { const a = id(0, i, NH), b = id(0, i + 1, NH), c = id(1, i + 1, NH), d = id(1, i, NH); idx.push(a, b, d, b, c, d); }
  // heel face
  { const a = id(0, 0, 0), b = id(0, 0, NH), c = id(1, 0, NH), d = id(1, 0, 0); for (let j = 0; j < NH; j++) idx.push(id(0, 0, j), id(1, 0, j), id(0, 0, j + 1), id(0, 0, j + 1), id(1, 0, j), id(1, 0, j + 1)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  // uv for the brushed/ground finish
  const uv = []; for (const side of [1, -1]) for (let i = 0; i <= NZ; i++) for (let j = 0; j <= NH; j++) uv.push(i / NZ, j / NH); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  // brushed-steel roughness / grind line texture
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d'); const R = mulberry(5);
  x.fillStyle = '#5a5a5a'; x.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 900; i++) { const y = R() * 256; x.strokeStyle = `rgba(${R() < .5 ? 255 : 0},${R() < .5 ? 255 : 0},${R() < .5 ? 255 : 0},.06)`; x.strokeStyle = R() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; x.lineWidth = .5 + R(); x.beginPath(); x.moveTo(0, y); x.lineTo(1024, y + (R() - .5) * 4); x.stroke(); }
  const gl = x.createLinearGradient(0, 256, 0, 0); gl.addColorStop(0, 'rgba(20,20,20,.9)'); gl.addColorStop(.22, 'rgba(20,20,20,.9)'); gl.addColorStop(.25, 'rgba(120,120,120,0)'); gl.addColorStop(1, 'rgba(120,120,120,0)');
  x.fillStyle = gl; x.fillRect(0, 0, 1024, 256);
  const rt = new THREE.CanvasTexture(c); rt.anisotropy = 8;
  const steel = new THREE.MeshPhysicalMaterial({ color: '#c3cad8', metalness: 1, roughness: .3, roughnessMap: rt, envMapIntensity: 1.6, anisotropy: .4, anisotropyRotation: 0, clearcoat: .3, clearcoatRoughness: .1 });
  const blade = new THREE.Mesh(g, steel); blade.castShadow = true; blade.receiveShadow = true;
  const knife = new THREE.Group(); knife.add(blade);
  // bolster + handle
  const bol = new THREE.Mesh(new RoundedBoxGeometry(.9, 3.4, 1.2, 4, .3), new THREE.MeshPhysicalMaterial({ color: '#c8cbd2', metalness: 1, roughness: .2 }));
  bol.position.set(0, 3.6, .5); bol.castShadow = true; knife.add(bol);
  const hs = new THREE.Shape(); hs.moveTo(0, 2.4); hs.bezierCurveTo(4, 2.0, 9, 2.1, 12, 2.6); hs.bezierCurveTo(12.6, 3.4, 12.6, 4.8, 11.8, 5.2); hs.bezierCurveTo(8, 5.4, 4, 5.3, 0, 5.1); hs.lineTo(0, 2.4);
  const hg = new THREE.ExtrudeGeometry(hs, { depth: .9, bevelEnabled: true, bevelThickness: .35, bevelSize: .32, bevelSegments: 6, curveSegments: 40 });
  hg.translate(0, 0, -.45); hg.rotateY(-Math.PI / 2);
  const handleMat = new THREE.MeshPhysicalMaterial({ color: '#141418', roughness: .38, clearcoat: .6, clearcoatRoughness: .25, sheen: .2 });
  const handle = new THREE.Mesh(hg, handleMat); handle.position.set(0, 0, 1.0); handle.castShadow = true; knife.add(handle);
  const rivMat = new THREE.MeshPhysicalMaterial({ color: '#d0d3da', metalness: 1, roughness: .18 });
  for (const zz of [3, 6.5, 10]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, 1.75, 24), rivMat); r.rotation.z = Math.PI / 2; r.position.set(0, 3.8, 1 + zz); knife.add(r); }
  knife.userData = { L, spine, edge, steel };
  return knife;
}

// soft contact shadow (multiplied dark radial blob) so resting objects sit on the board
let _cs = null;
export function contactShadow(scene, x, z, rx, rz, op = .55, rot = 0) {
  if (!_cs) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.35, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); _cs = new THREE.CanvasTexture(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: _cs, transparent: true, opacity: op, depthWrite: false, color: '#000' }));
  m.rotation.set(-Math.PI / 2, 0, rot); m.scale.set(rx * 2, rz * 2, 1); m.position.set(x, .015, z); m.renderOrder = 1; scene.add(m); return m;
}
