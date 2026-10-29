import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { gsap } from 'gsap';

const routes = { work: '#work', profile: '#about', skills: '#capabilities', experiments: '#experiments', note: 'mailto:948548474@qq.com?subject=你好，江南' };
export const drawerItems = [
  { id: 'work', title: '作品册', en: 'SELECTED WORKS', number: '01' },
  { id: 'profile', title: '个人档案', en: 'PROFILE', number: '02' },
  { id: 'skills', title: '技能卡', en: 'TOOLKIT', number: '03' },
  { id: 'experiments', title: '创作实验', en: 'EXPERIMENTS', number: '04' },
];

// All surfaces are authored locally; no external model or texture requests.
function paperTexture(type) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const c = canvas.getContext('2d');
  const colors = { work: '#dedccc', profile: '#b3ad84', skills: '#9fae82', experiments: '#263e35', note: '#d4b770', card: '#dedac5' };
  c.fillStyle = colors[type]; c.fillRect(0, 0, 768, 1024);
  for (let y = 0; y < 1024; y += 4) { c.fillStyle = y % 12 ? '#00000003' : '#ffffff0b'; c.fillRect(0, y, 768, 1); }
  c.fillStyle = type === 'experiments' ? '#d3d5b7' : '#25382a';
  c.font = '22px monospace'; c.fillText('JIANG NAN / DESIGN ARCHIVE', 50, 72);
  c.fillRect(50, 100, 668, 2);
  if (type === 'work') {
    c.fillStyle = '#dedcc2'; c.fillRect(0,0,768,1024);
    // Subtle paper fibres, fold lines and restrained archival typography.
    let seed = 91;
    for(let i=0;i<14000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%768;seed=(seed*1664525+1013904223)>>>0;c.fillStyle=i%2?'#84794b0c':'#ffffff12';c.fillRect(x,seed%1024,1,2);}
    c.strokeStyle='#a6a17e50';c.lineWidth=2;
    for(const x of [24,33,43]){c.beginPath();c.moveTo(x,0);c.lineTo(x,1024);c.stroke();}
    c.fillStyle='#425d3b';c.textAlign='center';
    c.font='italic 90px Georgia';c.fillText('Selected',390,470);
    c.font='92px Georgia';c.fillText('Case Study',390,565);
    c.fillStyle='#f1f0e5';c.fillRect(233,600,330,52);c.strokeStyle='#8c9679';c.lineWidth=1;c.strokeRect(233,600,330,52);
    c.fillStyle='#425d3b';c.font='27px Arial';c.fillText('Visual Design / Portfolio',398,635);
    c.font='18px Arial';c.fillText('Ideas, identities and visual possibilities.',390,707);
    c.save();c.translate(695,245);c.rotate(Math.PI/2);c.font='italic 24px Georgia';c.fillText('Independent design practice',0,0);c.restore();
    c.textAlign='left';c.font='bold 42px Georgia';c.fillText('JN',70,943);c.font='16px monospace';c.fillText('PERSONAL ARCHIVE — 01 / 2026',235,951);
  } else if (type === 'profile') {
    c.fillStyle = '#e5e1ce'; c.fillRect(60, 175, 648, 360);
    c.fillStyle = '#293e2c'; c.font = 'bold 86px Arial'; c.fillText('JIANG', 95, 300); c.fillText('NAN.', 95, 405);
    c.font = '28px monospace'; c.fillText('VISUAL DESIGNER', 95, 480);
    c.font = '26px monospace'; c.fillText('PERSONAL FILE / 02', 60, 660);
    for (let i = 0; i < 5; i++) { c.fillStyle = '#6c775b'; c.fillRect(60, 730 + i * 34, i % 2 ? 400 : 600, 3); }
    c.strokeStyle = '#747c59'; c.strokeRect(570, 860, 130, 90); c.font = '22px monospace'; c.fillText('PROFILE', 585, 915);
  } else if (type === 'skills') {
    c.font = 'bold 96px Arial'; c.fillText('TOOL', 50, 255); c.fillText('KIT.', 50, 360);
    c.font = '34px monospace'; ['VISUAL SYSTEM', 'BRAND IDENTITY', 'GENERATIVE AI', 'DIGITAL DESIGN'].forEach((s, i) => { c.fillText(`0${i + 1}`, 50, 520 + i * 105); c.fillText(s, 130, 520 + i * 105); });
    c.font = '24px monospace'; c.fillText('IDEA → EXECUTION', 50, 950);
  } else if (type === 'experiments') {
    c.strokeStyle = '#b1c48b'; c.lineWidth = 4;
    for (let r = 70; r < 300; r += 25) { c.beginPath(); c.arc(384, 490, r, 0, Math.PI * 2); c.stroke(); }
    c.font = 'bold 80px Arial'; c.fillText('PLAY.', 50, 875); c.font = '25px monospace'; c.fillText('VISUAL LAB / 04', 50, 950);
  } else if (type === 'note') {
    c.font = 'italic 90px Georgia'; c.fillText('Say hello.', 60, 290);
    c.font = '38px monospace'; c.fillText('LEAVE A NOTE', 60, 435);
    c.font = '30px monospace'; c.fillText('TO: JIANG NAN', 60, 560); c.fillText('LET’S TALK ↗', 60, 830);
    c.strokeStyle = '#66532e50'; c.lineWidth = 2; for (let y = 620; y < 800; y += 55) { c.beginPath(); c.moveTo(60, y); c.lineTo(680, y); c.stroke(); }
  } else { c.font = 'bold 90px Arial'; c.fillText('JN.', 60, 330); c.font = '33px monospace'; c.fillText('948548474', 60, 610); c.fillText('@qq.com', 60, 670); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function finishTexture(kind) {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  let seed = 719;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const grain = kind === 'roughness' ? 205 + seed % 30 : kind === 'paper' ? 118 + seed % 24 : 116 + seed % 24;
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = grain; data[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'paper' ? 3 : 7, kind === 'paper' ? 3 : 7);
  texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.generateMipmaps = true;
  texture.needsUpdate = true; return texture;
}

export default function CabinetScene({ opened, busy, theme, onThemeToggle, onToggle, onReady, onBusy }) {
  const mount = useRef(null), controls = useRef(null), lighting = useRef(null), labels = useRef({});
  const currentTheme = useRef(theme); currentTheme.current = theme;
  const callbacks = useRef({ onToggle, onReady, onBusy, onThemeToggle }); callbacks.current = { onToggle, onReady, onBusy, onThemeToggle };
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState('');
  useEffect(() => {
    const element = mount.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { callbacks.current.onReady(false); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.setClearColor(0x050605, 0);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.domElement.setAttribute('aria-hidden', 'true'); element.appendChild(renderer.domElement);
    setReady(true); callbacks.current.onReady(true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    const materials = new Set(), geometries = new Set(), textures = new Set(), interactive = [], items = [];
    const material = (color, roughness = 0.55, metalness = 0.1) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness }); materials.add(m); return m; };
    const enamelGrain = finishTexture('enamel'), paperGrain = finishTexture('paper'), roughnessGrain = finishTexture('roughness'); textures.add(enamelGrain); textures.add(paperGrain); textures.add(roughnessGrain);
    const enamel = (color, roughness = 0.43, metalness = 0.25) => { const m = new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: 0.22, clearcoatRoughness: 0.38, roughnessMap: roughnessGrain, bumpMap: enamelGrain, bumpScale: 0.018 }); materials.add(m); return m; };
    const green = enamel('#39664e'), pale = enamel('#4b7161', 0.48, 0.15), inner = enamel('#9aa88d', 0.58, 0.12), silver = material('#c9cbc5', 0.21, 0.91), dark = material('#102c23', 0.65), rust = material('#a94b32', 0.88, 0.025), brass = material('#bea16a', 0.3, 0.65);
    rust.bumpMap = enamelGrain; rust.bumpScale = .009;
    green.roughness = .57; green.clearcoat = .08; green.clearcoatRoughness = .55;
    silver.roughness = .32;
    // A dark photographic studio with broad softboxes and a narrow rim strip.
    // These reflection cards are baked once; they never appear as scene objects.
    const studio = new THREE.Scene(); studio.background = new THREE.Color('#080b09');
    const studioResources = [];
    for (const [position, dimensions, brightness] of [
      [[-4, 6, 3], [4.5, 6], [4.2, 3.9, 3.4]],
      [[1, 8, -2], [6, 2.8], [3.4, 3.6, 3.6]],
      [[4, 3, -4], [1.1, 5], [2.5, 3.2, 3.4]],
      [[0, 2.5, 7], [5, 1], [.7, .8, .7]],
    ]) {
      const geometry = new THREE.PlaneGeometry(...dimensions);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...brightness), side: THREE.DoubleSide });
      const panel = new THREE.Mesh(geometry, mat); panel.position.set(...position); panel.lookAt(0, 1, 0); studio.add(panel); studioResources.push(geometry, mat);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio, 0.035); pmrem.dispose(); for (const resource of studioResources) resource.dispose();
    scene.environment = environment.texture; scene.environmentIntensity = 0.75;
    silver.roughnessMap = roughnessGrain; silver.bumpMap = enamelGrain; silver.bumpScale = 0.0015;
    function mesh(geometry, mat, parent = scene, x = 0, y = 0, z = 0) {
      geometries.add(geometry); const m = new THREE.Mesh(geometry, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    }
    const box = (w, h, d, mat, parent, x, y, z, radius = 0.025) => mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 3, h / 3, d / 3)), mat, parent, x, y, z);
    const cylinder = (r1, r2, h, mat, parent, x, y, z) => mesh(new THREE.CylinderGeometry(r1, r2, h, 32), mat, parent, x, y, z);
    function rod(a, b, radius, mat, parent = scene) {
      const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
      const m = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 16), mat, parent);
      m.position.copy(start.add(end).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return m;
    }
    const cabinet = new THREE.Group(); scene.add(cabinet);
    box(5, 0.14, 3.3, green, cabinet, 0, 0.16, -1.1);
    box(5.05, 0.16, 3.35, green, cabinet, 0, 2.0, -1.1, 0.06);
    box(0.13, 1.8, 3.3, green, cabinet, -2.44, 1.08, -1.1);
    box(0.13, 1.8, 3.3, green, cabinet, 2.44, 1.08, -1.1);
    box(4.8, 1.8, 0.12, dark, cabinet, 0, 1.08, -2.69);
    box(4.82, 0.56, 0.16, green, cabinet, 0, 1.68, 0.62);
    box(4.8, 0.08, 3.2, dark, cabinet, 0, 1.36, -1.1);
    function handle(parent, y, z) {
      // Exact line/arc segments: no spline overshoot or floating tube endpoints.
      const curve = new THREE.CurvePath();
      const p = (x, yy, zz = .045) => new THREE.Vector3(x, y + yy, z + zz);
      curve.add(new THREE.LineCurve3(p(-.7,.1,-.18),p(-.7,.1,-.04)));
      curve.add(new THREE.QuadraticBezierCurve3(p(-.7,.1,-.04),p(-.7,.1),p(-.7,.015)));
      curve.add(new THREE.LineCurve3(p(-.7,.015), p(-.7,-.02)));
      curve.add(new THREE.QuadraticBezierCurve3(p(-.7,-.02),p(-.7,-.16),p(-.56,-.16)));
      curve.add(new THREE.LineCurve3(p(-.56,-.16),p(.56,-.16)));
      curve.add(new THREE.QuadraticBezierCurve3(p(.56,-.16),p(.7,-.16),p(.7,-.02)));
      curve.add(new THREE.LineCurve3(p(.7,-.02),p(.7,.015)));
      curve.add(new THREE.QuadraticBezierCurve3(p(.7,.015),p(.7,.1),p(.7,.1,-.04)));
      curve.add(new THREE.LineCurve3(p(.7,.1,-.04),p(.7,.1,-.18)));
      mesh(new THREE.TubeGeometry(curve, 96, .055, 20, false), silver, parent);
      for (const x of [-.7,.7]) {
        box(.22,.26,.018,dark,parent,x,y+.075,z-.177,.018);
        box(.2,.24,.04,silver,parent,x,y+.075,z-.155,.025);
        // The single continuous tube terminates inside each mounting plate.
        for (const offset of [-.065,.065]) {
          const screw = cylinder(.023,.023,.02,silver,parent,x,y+.075+offset,z-.126); screw.rotation.x = Math.PI/2;
          box(.029,.005,.004,dark,parent,x,y+.075+offset,z-.114,.001);
        }
      }
    }
    handle(cabinet, 1.67, 0.91);
    box(4.94, 0.025, 0.06, dark, cabinet, 0, 1.89, 0.61, 0.008);
    box(0.025, 1.67, 0.03, dark, cabinet, 2.39, 1.06, 0.58, 0.006);
    box(0.025, 1.67, 0.03, dark, cabinet, -2.39, 1.06, 0.58, 0.006);
    box(0.025, 1.72, 3.05, dark, cabinet, 2.37, 1.08, -1.06, 0.006);
    const drawer = new THREE.Group(); scene.add(drawer); drawer.position.z = 0.3;
    box(4.66, 0.1, 3.12, inner, drawer, 0, 0.48, -1.08);
    box(0.09, 0.63, 3.12, pale, drawer, -2.29, 0.79, -1.08);
    box(0.09, 0.63, 3.12, pale, drawer, 2.29, 0.79, -1.08);
    box(4.66, 0.6, 0.08, pale, drawer, 0, 0.8, -2.6);
    const front = box(4.96, 0.95, 0.18, green, drawer, 0, 0.84, 0.57, 0.05); front.userData.action = 'drawer'; interactive.push(front);
    handle(drawer, 0.85, 0.87);
    for (const part of drawer.children) { part.userData.action = 'drawer'; if (!interactive.includes(part)) interactive.push(part); }
    for (const x of [-2.36, 2.36]) rod([x, 0.39, -2.4], [x, 0.39, 0.4], 0.035, silver, drawer);
    for (const x of [-2.35,2.35]) {
      box(.055,.13,2.7,silver,drawer,x,.43,-.95,.008);
      box(.025,.035,2.5,dark,drawer,x + (x<0 ? -.032 : .032),.43,-.95,.003);
      for (const z of [-1.9,-.9,.1]) { const rivet=cylinder(.026,.026,.018,silver,drawer,x,.5,z); }
    }
    for (const x of [-2.15,2.15]) for (const z of [-2.35,.15]) cylinder(.12,.14,.07,dark,cabinet,x,.085,z);
    for (let i=0;i<5;i++) box(.012,.025,.44,dark,cabinet,2.509,.52+i*.09,-1.7,.006);
    // Hollow enamel shade, warm inner reflector and a physical base switch.
    const lamp = new THREE.Group(); cabinet.add(lamp);
    cylinder(0.37, 0.45, 0.16, rust, lamp, 1.25, 2.16, -1.55);
    cylinder(0.37, 0.38, 0.035, rust, lamp, 1.25, 2.25, -1.55);
    rod([1.25, 2.25, -1.55], [1.9, 3.65, -1.66], 0.045, rust, lamp);
    rod([1.9, 3.65, -1.66], [-0.16, 3.88, -1.34], 0.042, rust, lamp);
    for (const [x, y, z] of [[1.25, 2.3, -1.55], [1.9, 3.65, -1.66], [-0.16, 3.88, -1.34]]) mesh(new THREE.SphereGeometry(0.1, 24, 16), rust, lamp, x, y, z);
    cylinder(.38,.4,.025,dark,lamp,1.25,2.087,-1.55);
    for (const [x,y,z] of [[1.25,2.3,-1.55],[1.9,3.65,-1.66],[-.16,3.88,-1.34]]) {
      const axle = cylinder(.045,.045,.215,dark,lamp,x,y,z); axle.rotation.x=Math.PI/2;
      const cap = cylinder(.055,.055,.012,brass,lamp,x,y,z+.113); cap.rotation.x=Math.PI/2;
      box(.05,.008,.004,dark,lamp,x,y,z+.121,.001);
    }
    const shadeGroup = new THREE.Group(); shadeGroup.position.set(-0.16, 3.6, -1.34); shadeGroup.rotation.z = -0.1; lamp.add(shadeGroup);
    const profile = [[0.09, 0.27], [0.13, 0.26], [0.42, -0.22], [0.42, -0.25], [0.4, -0.25], [0.11, 0.22]].map(([x, y]) => new THREE.Vector2(x, y));
    mesh(new THREE.LatheGeometry(profile, 64), rust, shadeGroup);
    const reflectorMat = material('#f1debc', 0.48, 0.15); reflectorMat.side = THREE.DoubleSide;
    mesh(new THREE.LatheGeometry([new THREE.Vector2(0.1, 0.21), new THREE.Vector2(0.392, -0.237)], 64), reflectorMat, shadeGroup);
    const lightMat = new THREE.MeshStandardMaterial({ color: '#fff1c9', emissive: '#ffcb81', emissiveIntensity: 1.4 }); materials.add(lightMat);
    const lip = mesh(new THREE.TorusGeometry(0.405, 0.012, 12, 64), rust, shadeGroup, 0, -0.243, 0); lip.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.075, 20, 16), lightMat, shadeGroup, 0, -0.08, 0);
    const switchMesh = cylinder(0.052, 0.052, 0.055, dark, lamp, 1.48, 2.295, -1.42);
    lamp.traverse(part => { if (part.isMesh) part.userData.action = 'lamp'; });
    const lampLight = new THREE.SpotLight('#ffd298', 13, 7, Math.PI / 2.7, 1, 2);
    lampLight.position.set(-0.16, 3.32, -1.34); lampLight.target.position.set(-0.2, 1.9, -0.75); scene.add(lampLight, lampLight.target);
    const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext('2d'), gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,222,164,.8)'); gradient.addColorStop(.25, 'rgba(255,209,130,.18)'); gradient.addColorStop(1, 'rgba(255,200,110,0)');
    glowContext.fillStyle = gradient; glowContext.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas); textures.add(glowTexture);
    const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }); materials.add(glowMaterial);
    const glow = new THREE.Sprite(glowMaterial); glow.userData.action = 'lamp'; glow.scale.set(1.35, 1.35, 1); glow.position.set(-0.18, 3.31, -1.32); scene.add(glow);
    const cable = new THREE.CatmullRomCurve3([new THREE.Vector3(1.3, 2.13, -1.65), new THREE.Vector3(2.5, 2.1, -2), new THREE.Vector3(2.7, 1, -2.1), new THREE.Vector3(2.8, 0.12, -1.7), new THREE.Vector3(3.1, 0.1, -0.8)]);
    const cableMesh = mesh(new THREE.TubeGeometry(cable, 48, 0.027, 12, false), rust, cabinet); cableMesh.userData.action = 'lamp';
    // Small stationery on the cabinet top.
    const pencil = cylinder(0.028, 0.028, 1.2, brass, cabinet, -1.23, 2.12, -0.6); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = 0.2;
    box(1.5, 0.025, 0.7, inner, cabinet, -1.25, 2.1, -0.7);
    // Pinned paper on the closed upper drawer. It remains a separate email target.
    const noteTexture = paperTexture('note'); textures.add(noteTexture);
    const noteMat = new THREE.MeshStandardMaterial({ map: noteTexture, roughness: 0.87, bumpMap: paperGrain, bumpScale: 0.004, side: THREE.DoubleSide }); materials.add(noteMat);
    const noteGroup = new THREE.Group(); noteGroup.position.set(1.5, 1.55, 0.74); noteGroup.rotation.z = -0.09; cabinet.add(noteGroup);
    const noteGeometry = new THREE.PlaneGeometry(.8, .94, 8, 12);
    const notePositions = noteGeometry.attributes.position;
    for (let i = 0; i < notePositions.count; i++) { const y = notePositions.getY(i); notePositions.setZ(i, .035 * Math.pow(Math.max(0, -y / .47), 2)); }
    noteGeometry.computeVertexNormals();
    const note = mesh(noteGeometry, noteMat, noteGroup); note.userData.action = 'note'; interactive.push(note);
    mesh(new THREE.SphereGeometry(0.045, 12, 10), brass, noteGroup, 0, 0.4, 0.025);
    const noteAnchor = new THREE.Object3D(); noteAnchor.position.set(1.6, 1.65, 0.85); cabinet.add(noteAnchor);
    const lampAnchor = new THREE.Object3D(); lampAnchor.position.set(0.1, 3.55, -1.3); cabinet.add(lampAnchor);
    const anchors = { note: noteAnchor, lamp: lampAnchor };
    function page(type, w, d, x, z, rot, y, baseColor) {
      const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = rot; drawer.add(group);
      const backing = box(w, type === 'work' ? .025 : .055, d, material(type === 'work' ? '#425b3c' : baseColor), group, 0, 0, 0, 0.015);
      backing.userData.action = type; interactive.push(backing);
      if (type === 'work' || type === 'profile') {
        const edge = material('#dad5c2', 0.93);
        for (let i = 0; i < 3; i++) box(w - .01, .004, d - .01, edge, group, .004 * i, .017 + i * .005, .004 * i, .001);
      }
      const tex = paperTexture(type); textures.add(tex);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, bumpMap: paperGrain, bumpScale: 0.004 }); materials.add(mat);
      let coverGeometry;
      if(type === 'work') {
        const left=-w/2+.025,right=w/2-.13,top=d/2-.025,bottom=-d/2+.025;
        const shape=new THREE.Shape();shape.moveTo(left,bottom);shape.lineTo(right-.04,bottom);shape.quadraticCurveTo(right+.03,bottom,right+.03,bottom+.07);
        shape.lineTo(right+.03,-d*.2);shape.quadraticCurveTo(right+.03,-d*.16,right-.07,-d*.15);shape.lineTo(right-.07,d*.15);shape.quadraticCurveTo(right-.07,d*.2,right+.03,d*.21);
        shape.lineTo(right+.03,top-.07);shape.quadraticCurveTo(right+.03,top,right-.04,top);shape.lineTo(left,top);shape.closePath();
        coverGeometry=new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:2,steps:1});
        const uv=coverGeometry.attributes.uv,positions=coverGeometry.attributes.position;
        for(let i=0;i<uv.count;i++)uv.setXY(i,(positions.getX(i)+w/2)/w,(positions.getY(i)+d/2)/d);
      } else coverGeometry=new THREE.PlaneGeometry(w-.025,d-.025);
      const cover = mesh(coverGeometry, mat, group, 0, type === 'work' ? .047 : .032, 0); cover.rotation.x = -Math.PI / 2;
      cover.userData.action = type; interactive.push(cover);
      const anchor = new THREE.Object3D(); anchor.position.set(0, 0.13, type === 'work' ? .9 : 0); group.add(anchor); anchors[type] = anchor;
      items.push({ group, y, type }); return group;
    }
    // Loosely layered documents, with separated interactive surfaces in the final view.
    box(2.55, 0.025, 2.65, material('#b9a47e'), drawer, -0.65, 0.56, -1.07);
    page('profile', 1.5, 1.95, 1.18, -1.48, -0.12, 0.6, '#a7a17b');
    const portfolio = page('work', 2.12, 2.56, -0.92, -1.1, 0.08, 0.65, '#ddddcb');
    // Green woven liner shows through the folder's die-cut edge.
    const clothCanvas=document.createElement('canvas');clothCanvas.width=clothCanvas.height=128;
    const clothContext=clothCanvas.getContext('2d');clothContext.fillStyle='#43593e';clothContext.fillRect(0,0,128,128);
    for(let i=0;i<128;i+=4){clothContext.fillStyle='#a5ad7d';clothContext.fillRect(i,0,1,128);clothContext.fillStyle='#243e2a';clothContext.fillRect(0,i,128,1);}
    const clothTexture=new THREE.CanvasTexture(clothCanvas);clothTexture.colorSpace=THREE.SRGBColorSpace;clothTexture.wrapS=clothTexture.wrapT=THREE.RepeatWrapping;clothTexture.repeat.set(2,12);textures.add(clothTexture);
    const clothMaterial=new THREE.MeshStandardMaterial({map:clothTexture,roughness:.96});materials.add(clothMaterial);
    const liner=mesh(new THREE.PlaneGeometry(.17,2.5),clothMaterial,portfolio,.96,.039,0);liner.rotation.x=-Math.PI/2;liner.userData.action='work';
    // Work prints peek out from beneath the file, using the site's actual local concept artworks.
    const loader=new THREE.TextureLoader();
    for(const [i,name] of ['signal','digital'].entries()){
      const printGroup=new THREE.Group();printGroup.position.set(i ? .24 : -.08,-.02-i*.012,i ? .08 : -.08);printGroup.rotation.y=i ? -.11 : .07;portfolio.add(printGroup);
      const print=box(2.02,.008,2.58,material('#f0eee3',.95),printGroup,0,0,0,.002);print.userData.action='work';
      const tex=loader.load(`/studies/${name}.svg`,()=>requestRender());tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);
      const printMat=new THREE.MeshStandardMaterial({map:tex,roughness:.95});materials.add(printMat);
      const image=mesh(new THREE.PlaneGeometry(1.88,2.15),printMat,printGroup,0,.006,-.06);image.rotation.x=-Math.PI/2;image.userData.action='work';
    }
    // A small labelled contact print, physically held by a metal bulldog clip.
    const photo=box(.54,.012,.68,material('#f4f1e6',.93),portfolio,-.62,.077,-.8,.003);photo.rotation.y=-.06;photo.userData.action='work';
    const miniTexture=loader.load('/studies/identity.svg',()=>requestRender());miniTexture.colorSpace=THREE.SRGBColorSpace;textures.add(miniTexture);
    const miniMat=new THREE.MeshStandardMaterial({map:miniTexture,roughness:.95});materials.add(miniMat);
    const mini=mesh(new THREE.PlaneGeometry(.46,.46),miniMat,portfolio,-.62,.086,-.86);mini.rotation.x=-Math.PI/2;mini.userData.action='work';
    box(.3,.035,.08,silver,portfolio,-.62,.12,-1.12,.008);
    const clipLoop=mesh(new THREE.TorusGeometry(.065,.013,10,24),silver,portfolio,-.62,.15,-1.23);clipLoop.rotation.x=-Math.PI/2;
    rod([-.7,.12,-1.12],[-.67,.15,-1.23],.012,silver,portfolio);rod([-.54,.12,-1.12],[-.57,.15,-1.23],.012,silver,portfolio);
    // Color swatches beneath the skill card.
    for (let i = 0; i < 3; i++) { const swatch = box(1.1, 0.015, 1.5, material(['#9f7657', '#d8cfac', '#526b4b'][i]), drawer, 1.22 + i * 0.04, 0.57 + i * 0.02, -0.38); swatch.rotation.y = -0.2 + i * 0.12; }
    page('skills', 1.12, 1.3, 1.2, -0.38, 0.13, 0.68, '#9fae82');
    const disk = page('experiments', 0.9, 0.97, 0, -2.03, -0.12, 0.78, '#263b30');
    box(0.45, 0.025, 0.2, silver, disk, 0, 0.047, -0.35);
    // A pen and a few clips add scale, without hiding the navigation objects.
    rod([-1.88, 0.78, -0.1], [-1.7, 0.78, -1.4], 0.028, brass, drawer);
    for (const [x, z] of [[0.1, 0.1], [1.9, -2.3]]) { const clip = mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 20), silver, drawer, x, 0.58, z); clip.rotation.x = -Math.PI / 2; clip.scale.x = 0.45; }
    // Grounded soft shadow on an entirely black backdrop.
    const ground = mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.12 }), scene, 0, 0.05, 0); materials.add(ground.material); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
    const contactCanvas = document.createElement('canvas'); contactCanvas.width = contactCanvas.height = 128;
    const contactContext = contactCanvas.getContext('2d'), contactGradient = contactContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    contactGradient.addColorStop(0, 'rgba(12,22,16,.36)'); contactGradient.addColorStop(.45, 'rgba(12,22,16,.2)'); contactGradient.addColorStop(1, 'rgba(12,22,16,0)');
    contactContext.fillStyle = contactGradient; contactContext.fillRect(0, 0, 128, 128);
    const contactTexture = new THREE.CanvasTexture(contactCanvas); textures.add(contactTexture);
    const contactMaterial = new THREE.MeshBasicMaterial({map: contactTexture, transparent:true, depthWrite:false}); materials.add(contactMaterial);
    const contactShadow = mesh(new THREE.PlaneGeometry(7.2, 4.8), contactMaterial, scene, .25, .056, -.6); contactShadow.rotation.x = -Math.PI / 2; contactShadow.castShadow = false; contactShadow.receiveShadow = false;
    const hemisphere = new THREE.HemisphereLight('#e9f1ed', '#253d32', 1.5); scene.add(hemisphere);
    const key = new THREE.DirectionalLight('#fff2df', 1.8); key.position.set(-3.5, 7, 4.5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.blurSamples = 8; key.shadow.camera.left = -7; key.shadow.camera.right = 7; key.shadow.camera.top = 7; key.shadow.camera.bottom = -7; key.shadow.normalBias = 0.012; key.shadow.bias = -0.0001; key.shadow.radius = 3; scene.add(key);
    const rim = new THREE.DirectionalLight('#bbd9d5', 1.8); rim.position.set(5, 5, -4); scene.add(rim);
    const fill = new THREE.DirectionalLight('#a6bac8', 0.65); fill.position.set(-4, 2, -3); scene.add(fill);
    RectAreaLightUniformsLib.init();
    const softbox = new THREE.RectAreaLight('#fff0da', 3, 4.5, 5); softbox.position.set(-3.5, 6, 4); softbox.lookAt(0, 1, -1); scene.add(softbox);
    const stripbox = new THREE.RectAreaLight('#c2d7e3', 2, 1.2, 4); stripbox.position.set(4, 4, -2.5); stripbox.lookAt(0, 1, -1); scene.add(stripbox);
    const beautyTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, beautyTarget);
    const beautyPass = new RenderPass(scene, camera); composer.addPass(beautyPass);
    const aoPass = new GTAOPass(scene, camera, 512, 512, undefined, { radius: .22, thickness: .25, distanceFallOff: 1, samples: 8 }, { samples: 8 });
    aoPass.blendIntensity = .65; composer.addPass(aoPass);
    const outputPass = new OutputPass(); composer.addPass(outputPass);
    const deskGlow = new THREE.RectAreaLight('#ffddb0', 0, .65, .55); deskGlow.position.set(-.16,3.3,-1.34); deskGlow.lookAt(-.2,1.8,-.8); scene.add(deskGlow);
    const progress = { value: 0 }, lightState = { value: currentTheme.current === 'night' ? 1 : 0 }, reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0, disposed = false, visible = true, hover = null;
    const animations = { camera: null, light: null };
    function advanceAnimation(channel) {
      const animation = animations[channel]; if (!animation) return;
      // Advance by wall time: expensive frames must not stretch a 1.6s move indefinitely.
      animation.tween.totalTime((performance.now() - animation.start) / 1000);
      if (animation.tween.progress() >= 1) animations[channel] = null;
    }
    const projection = new THREE.Vector3();
    function render() {
      raf = 0; if (disposed || !visible || document.hidden) return;
      advanceAnimation('camera'); advanceAnimation('light');
      const t = progress.value, night = lightState.value;
      deskGlow.intensity = night * 3.2;
      lampLight.intensity = THREE.MathUtils.lerp(0, 2.2, night);
      lightMat.emissiveIntensity = THREE.MathUtils.lerp(0, 1.1, night);
      glowMaterial.opacity = night * 0.16;
      hemisphere.intensity = THREE.MathUtils.lerp(.9, .35, night);
      key.intensity = THREE.MathUtils.lerp(1.2, .65, night);
      fill.intensity = THREE.MathUtils.lerp(.35, .12, night);
      rim.intensity = THREE.MathUtils.lerp(.7, .7, night);
      scene.environmentIntensity = THREE.MathUtils.lerp(1.15, .85, night);
      softbox.intensity = THREE.MathUtils.lerp(5.5, 4.0, night); stripbox.intensity = THREE.MathUtils.lerp(1.8, 1.2, night);
      renderer.toneMappingExposure = THREE.MathUtils.lerp(1.08, 1.02, night);
      element.parentElement.dataset.view = t >= .9999 ? 'open' : t <= .0001 ? 'closed' : 'moving';
      element.parentElement.dataset.lamp = night >= .9999 ? 'on' : night <= .0001 ? 'off' : 'changing';
      drawer.position.z = THREE.MathUtils.lerp(0.3, 3.2, t);
      const aspect = camera.aspect;
      const narrow = aspect < .8 ? 1.15 : 1;
      camera.zoom = THREE.MathUtils.lerp(aspect > 1.3 ? 1.24 : 1, 1, t); camera.updateProjectionMatrix();
      camera.position.set(THREE.MathUtils.lerp(6.1, 0, t) * narrow, THREE.MathUtils.lerp(5.3, 10.8, t) * narrow, THREE.MathUtils.lerp(8.6, 6.0, t) * narrow);
      camera.lookAt(THREE.MathUtils.lerp(.32, 0, t), THREE.MathUtils.lerp(1.55, 0.65, t), THREE.MathUtils.lerp(-0.3, 1.35, t)); camera.updateMatrixWorld();
      scene.updateMatrixWorld(); composer.render();
      for (const [id, anchor] of Object.entries(anchors)) {
        const label = labels.current[id]; if (!label) continue;
        anchor.getWorldPosition(projection); projection.project(camera);
        if (id === 'lamp') {
          label.style.visibility = projection.y < 0.86 && projection.y > -0.95 ? 'visible' : 'hidden';
          const rect = element.getBoundingClientRect();
          document.documentElement.style.setProperty('--lamp-screen-x', `${rect.left + (projection.x * 0.5 + 0.5) * rect.width}px`);
          document.documentElement.style.setProperty('--lamp-screen-y', `${rect.top + (-projection.y * 0.5 + 0.5) * rect.height}px`);
        }
        label.style.left = `${(projection.x * 0.5 + 0.5) * 100}%`; label.style.top = `${(-projection.y * 0.5 + 0.5) * 100}%`;
      }
      if (animations.camera || animations.light) requestRender();
    }
    const requestRender = () => { if (!raf && !disposed) raf = requestAnimationFrame(render); };
    let intendedOpen = false;
    function transition(open) {
      intendedOpen = open;
      animations.camera?.tween.kill(); animations.camera = null;
      const target = open ? 1 : 0;
      if (progress.value === target || reduced.matches) {
        progress.value = target; callbacks.current.onBusy(false); requestRender(); return;
      }
      callbacks.current.onBusy(true);
      const tween = gsap.to(progress, { value: target, duration: 1.6, ease: 'power3.inOut', paused: true, onComplete: () => callbacks.current.onBusy(false) });
      animations.camera = { tween, start: performance.now() }; requestRender();
    }
    controls.current = transition;
    let lightingTheme = currentTheme.current;
    lighting.current = (nextTheme) => {
      if (lightingTheme === nextTheme) return;
      lightingTheme = nextTheme;
      animations.light?.tween.kill(); animations.light = null;
      shadeGroup.rotation.z = -0.1; switchMesh.position.y = 2.295;
      if (reduced.matches) { lightState.value = nextTheme === 'night' ? 1 : 0; requestRender(); return; }
      const tween = gsap.timeline({ paused: true });
      tween.to(lightState, { value: nextTheme === 'night' ? 1 : 0, duration: .95, ease: 'power2.inOut' }, 0)
        .to(shadeGroup.rotation, { z: -.17, duration: .2, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 0)
        .to(switchMesh.position, { y: 2.27, duration: .16, repeat: 1, yoyo: true }, 0);
      animations.light = { tween, start: performance.now() }; requestRender();
    };
    const onReduced = () => {
      animations.camera?.tween.kill(); animations.light?.tween.kill(); animations.camera = animations.light = null;
      lightState.value = currentTheme.current === 'night' ? 1 : 0;
      shadeGroup.rotation.z = -0.1; switchMesh.position.y = 2.295; progress.value = intendedOpen ? 1 : 0;
      for (const item of items) { gsap.killTweensOf(item.group.position); item.group.position.y = item.y; }
      callbacks.current.onBusy(false); requestRender();
    };
    reduced.addEventListener('change', onReduced);
    const resize = () => { const { width, height } = element.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); composer.setSize(width, height); aoPass.setSize(Math.round(width * renderer.getPixelRatio() * .55), Math.round(height * renderer.getPixelRatio() * .55)); requestRender(); };
    const ro = new ResizeObserver(resize); ro.observe(element);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestRender(); }); io.observe(element);
    const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down = null;
    function hit(event) {
      const rect = element.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      // Include every mesh as an occluder, so closed drawers cannot activate hidden objects.
      const hits = ray.intersectObjects(scene.children, true).filter(h => h.object !== ground);
      const action = hits[0]?.object.userData.action;
      if (action && (action === 'drawer' || action === 'note' || action === 'lamp' || progress.value > 0.99)) return action;
      return null;
    }
    function hoverItem(id) {
      if (hover === id) return; hover = id; setSelected(id || '');
      for (const item of items) gsap.to(item.group.position, { y: item.y + (item.type === id && !reduced.matches ? 0.09 : 0), duration: reduced.matches ? 0 : 0.3, overwrite: true, onUpdate: requestRender });
      renderer.domElement.style.cursor = id ? 'pointer' : 'default';
    }
    const move = e => hoverItem(hit(e));
    const leave = () => { down = null; hoverItem(null); };
    const pointerDown = e => { down = { x: e.clientX, y: e.clientY }; };
    const pointerUp = e => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) { down = null; return; } down = null;
      const id = hit(e); if (id === 'drawer') callbacks.current.onToggle(); else if (id === 'lamp') callbacks.current.onThemeToggle(); else if (id && routes[id]) window.location.href = routes[id];
    };
    const canvas = renderer.domElement;
    const contextLost = e => { e.preventDefault(); if (!disposed) { setReady(false); callbacks.current.onReady(false); } };
    const contextRestored = () => { if (!disposed) { setReady(true); callbacks.current.onReady(true); requestRender(); } };
    canvas.addEventListener('webglcontextlost', contextLost); canvas.addEventListener('webglcontextrestored', contextRestored);
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave); canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointerup', pointerUp);
    const visibility = () => { if (!document.hidden) requestRender(); }; document.addEventListener('visibilitychange', visibility);
    resize();
    return () => {
      disposed = true; animations.camera?.tween.kill(); animations.light?.tween.kill(); controls.current = null; lighting.current = null; cancelAnimationFrame(raf); gsap.killTweensOf(progress); gsap.killTweensOf(lightState); gsap.killTweensOf(shadeGroup.rotation); gsap.killTweensOf(switchMesh.position);
      for (const item of items) gsap.killTweensOf(item.group.position);
      ro.disconnect(); io.disconnect(); reduced.removeEventListener('change', onReduced); document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointerup', pointerUp);
      for (const g of geometries) g.dispose(); for (const m of materials) m.dispose(); for (const t of textures) t.dispose();
      key.shadow.dispose(); aoPass.gtaoMaterial.dispose(); aoPass.blendMaterial.dispose(); aoPass.dispose(); outputPass.dispose(); composer.dispose(); environment.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    };
  }, []);
  useEffect(() => { controls.current?.(opened); }, [opened]);
  useEffect(() => { lighting.current?.(theme); }, [theme]);
  return <div className={`cabinet-viewport ${ready ? 'webgl-ready' : 'webgl-fallback'} ${opened ? 'is-open' : ''}`}>
    <div className="cabinet-canvas" ref={mount}/>
    {!ready && <div className="cabinet-fallback-art" aria-hidden="true"><span>JIANG NAN / ARCHIVE</span><div/><div className={opened ? 'pulled' : ''}/></div>}
    <button className="cabinet-lamp-label" ref={e => { labels.current.lamp = e; }} onClick={onThemeToggle} aria-label={theme === 'night' ? '点击台灯关闭灯光，进入白天模式' : '点击台灯打开灯光，进入暗夜模式'} aria-pressed={theme === 'night'}><span className="lamp-state-dot"/>{theme === 'night' ? '关灯 / DAY' : '开灯 / NIGHT'} ↗</button>
    <a className="cabinet-note-label" ref={e => { labels.current.note = e; }} href={routes.note} aria-label="点击便签，通过邮箱联系江南">留张便签 ↗</a>
    <div className="cabinet-object-labels" aria-label="抽屉内的物品" inert={!opened || busy}>
      {drawerItems.map(item => <a key={item.id} ref={e => { labels.current[item.id] = e; }} href={routes[item.id]} className={`cabinet-object-label ${selected === item.id ? 'is-hovered' : ''}`}><span>{item.number}</span> {item.title} ↗</a>)}
    </div>
  </div>;
}
