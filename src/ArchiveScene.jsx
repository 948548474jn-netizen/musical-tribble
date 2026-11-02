import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function disposeObject(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [object.material].flat().filter(Boolean)) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  textures.forEach((texture) => { texture.source?.data?.close?.(); texture.dispose(); });
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

// Reflection cards are independent of the visible background. No remote HDRI is required.
function studioEnvironment(renderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0.018, 0.032, 0.052);
  const card = (position, size, color) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    mesh.position.set(...position); mesh.lookAt(0, 0.6, 0); studio.add(mesh);
  };
  card([-3, 4, 2], [4, 3], new THREE.Color(5.2, 4.6, 3.8));
  card([-2, 4, -3], [4.5, 3.5], new THREE.Color(3.6, 3.8, 3.2));
  card([3, 2, -2], [2, 3], new THREE.Color(0.65, 0.9, 1.3));
  card([0, -2, 0], [8, 8], new THREE.Color(0.035, 0.07, 0.10));
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(studio, 0.06);
  generator.dispose(); disposeObject(studio);
  return target;
}

export default function ArchiveScene({ open, onToggle, onReady, onTransitionEnd, onSelectFolder }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useGSAP(() => {
    const host = hostRef.current;
    const abort = new AbortController();
    let alive = true, renderer, environment, scene, model, observer, visibility;
    let frame = 0, rayHandler, cursorHandler, lostHandler, restoredHandler;
    const invalidate = () => {
      if (!alive || frame || !renderer || !apiRef.current?.visible) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!alive || !apiRef.current) return;
        apiRef.current.frameCamera?.();
        renderer.shadowMap.needsUpdate = true;
        renderer.render(scene, apiRef.current.camera);
        host.dataset.drawerPosition = apiRef.current.drawer.position.z.toFixed(3);
      });
    };

    async function setup() {
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false });
        renderer.setClearColor(0, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.AgXToneMapping;
        renderer.toneMappingExposure = 1.10;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.shadowMap.autoUpdate = false;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        environment = studioEnvironment(renderer); scene.environment = environment.texture;
        scene.environmentIntensity = 0.68;
        scene.add(new THREE.HemisphereLight(0x9fbdd4, 0x0b1820, 0.40));
        const key = new THREE.DirectionalLight(0xffe5c6, 3.2);
        key.position.set(-3, 5, 3); key.target.position.set(0, 0.35, 0);
        key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
        Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.1, far: 12 });
        key.shadow.bias = -0.00015; key.shadow.normalBias = 0.001; key.shadow.radius = 6; key.shadow.blurSamples = 12;
        scene.add(key, key.target);
        const fill = new THREE.DirectionalLight(0x779fcb, 0.65); fill.position.set(3, 2, -2); scene.add(fill);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.20 }));
        ground.rotation.x = -Math.PI / 2; ground.position.y = -0.001;
        ground.receiveShadow = true; ground.material.depthWrite = false; scene.add(ground);

        const response = await fetch(`${import.meta.env.BASE_URL}models/portfolio-archive.glb`, { signal: abort.signal });
        if (!response.ok) throw new Error(`Scene request failed: ${response.status}`);
        const data = await response.arrayBuffer();
        if (!alive) return;
        const gltf = await new GLTFLoader().parseAsync(data, `${import.meta.env.BASE_URL}models/`);
        if (!alive) { disposeObject(gltf.scene); return; }
        model = gltf.scene;
        let drawer, meshCount = 0;
        const handles = [];
        const archiveRoots = new Map();
        model.traverse((object) => {
          const name = object.userData.name || object.name;
          if (name === 'DRAWER 02 · resume portfolio skills') drawer = object;
          if (name.startsWith('FOLDER 01')) archiveRoots.set(object, 'work');
          if (name.startsWith('FOLDER 02')) archiveRoots.set(object, 'resume');
          if (name.startsWith('FOLDER 03')) archiveRoots.set(object, 'skills');
          if (name.startsWith('MESSAGE 0')) archiveRoots.set(object, 'contact');
          if (!object.isMesh) return;
          meshCount++;
          object.castShadow = true; object.receiveShadow = true;
          if (/Drawer 2.*(metal handle|enamel front)/.test(name)) handles.push(object);
          for (const material of [object.material].flat()) {
            for (const value of Object.values(material)) if (value?.isTexture) value.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          }
        });
        if (!drawer) throw new Error('The supplied drawer control is missing');
        scene.add(model);
        // Frame the fully open silhouette so moving the real drawer never clips it.
        const homeZ = drawer.position.z;
        drawer.position.z = 0.68; model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const framingPoints = [];
        model.traverse((object) => {
          if (!object.isMesh) return;
          object.geometry.computeBoundingBox();
          const box = object.geometry.boundingBox;
          for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
            framingPoints.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
          }
        });
        drawer.position.z = homeZ; model.updateMatrixWorld(true);
        const center = bounds.getCenter(new THREE.Vector3());
        const camera = new THREE.PerspectiveCamera(35, 1, 0.03, 50);
        const direction = new THREE.Vector3(0.686, 1.407, 1.484).normalize();
        camera.position.copy(center).add(direction); camera.lookAt(center);
        const inverse = camera.quaternion.clone().invert();
        const corners = framingPoints.map((point) => point.clone().sub(center).applyQuaternion(inverse));
        apiRef.current = { drawer, camera, invalidate, visible: true, pose: { progress: 0 } };
        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height || !alive) return;
          renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 600 ? 1.25 : 1.75));
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.clearViewOffset(); camera.zoom = 1;
          apiRef.current.frameCamera = null;
          const prepareTransition = (homeTarget) => {
            const homePosition = camera.position.clone();
            const homeZoom = camera.zoom, homeFov = camera.fov;
            const offsetX = camera.view?.offsetX || 0, offsetY = camera.view?.offsetY || 0;
            const topTarget = new THREE.Vector3(0, 0.14, 0.69);
            const topDistance = Math.max(1.72, 1.35 / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * camera.aspect * 0.90));
            const topPosition = topTarget.clone().add(new THREE.Vector3(0, topDistance, 0));
            const target = new THREE.Vector3();
            apiRef.current.frameCamera = () => {
              const progress = apiRef.current.pose.progress;
              camera.position.lerpVectors(homePosition, topPosition, progress);
              camera.up.set(0, 1 - progress, -progress).normalize();
              target.lerpVectors(homeTarget, topTarget, progress);
              camera.lookAt(target);
              camera.fov = THREE.MathUtils.lerp(homeFov, 40, progress);
              camera.zoom = THREE.MathUtils.lerp(homeZoom, 1, progress);
              camera.setViewOffset(width, height, offsetX * (1 - progress), offsetY * (1 - progress), width, height);
              camera.updateProjectionMatrix(); camera.updateMatrixWorld();
              host.dataset.cameraPhase = progress.toFixed(3);
            };
          };
          camera.up.set(0, 1, 0);
          if (width > 760) {
            // Match the supplied composition using two visible landmarks and the
            // original close Blender camera, rather than a distant bounding-box view.
            camera.fov = 40;
            camera.position.set(0.716, 2.067, 1.724);
            camera.lookAt(0.03, 0.66, 0.24);
            camera.updateProjectionMatrix(); camera.updateMatrixWorld();
            const lamp = new THREE.Vector3(-0.12, 1.48, -0.20);
            const cabinetCorner = new THREE.Vector3(-0.65, 0.6925, -0.43);
            const pixel = (point) => {
              const p = point.clone().project(camera);
              return new THREE.Vector2((p.x * 0.5 + 0.5) * width, (-p.y * 0.5 + 0.5) * height);
            };
            const delta = pixel(lamp).sub(pixel(cabinetCorner));
            const wantedDelta = new THREE.Vector2((0.708 - 0.619) * width, (0.120 - 0.355) * height);
            const homeZoom = delta.dot(wantedDelta) / delta.lengthSq();
            camera.zoom = homeZoom;
            camera.updateProjectionMatrix();
            const anchor = pixel(lamp);
            camera.setViewOffset(width, height, anchor.x - 0.708 * width, anchor.y - 0.120 * height, width, height);
            camera.updateProjectionMatrix();
            prepareTransition(new THREE.Vector3(0.03, 0.66, 0.24));
            invalidate();
            return;
          }
          camera.fov = 35;
          const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
          const tanX = tanY * camera.aspect;
          const distance = Math.max(...corners.flatMap((point) => [point.z + Math.abs(point.x) / (tanX * 0.91), point.z + Math.abs(point.y) / (tanY * 0.91)]));
          camera.position.copy(center).addScaledVector(direction, distance);
          camera.updateProjectionMatrix(); camera.lookAt(center); camera.updateMatrixWorld();
          const projectedBounds = () => {
            const points = framingPoints.map((point) => point.clone().project(camera));
            return [Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x)), Math.min(...points.map((p) => p.y)), Math.max(...points.map((p) => p.y))];
          };
          let [left, right, bottom, top] = projectedBounds();
          camera.zoom = Math.min(1.82 / (right - left), 1.82 / (top - bottom));
          camera.updateProjectionMatrix();
          [left, right, bottom, top] = projectedBounds();
          camera.setViewOffset(width, height, width * (left + right) / 4, -height * (bottom + top) / 4, width, height);
          camera.updateProjectionMatrix(); prepareTransition(center); invalidate();
        };
        observer = new ResizeObserver(resize); observer.observe(host); resize();
        visibility = new IntersectionObserver(([entry]) => {
          if (!alive || !apiRef.current) return;
          apiRef.current.visible = entry.isIntersecting;
          if (entry.isIntersecting) invalidate();
        });
        visibility.observe(host);

        const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
        const actionAt = (event) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(model.children, true)[0];
          if (!hit) return null;
          let object = hit.object;
          while (object) {
            const section = archiveRoots.get(object);
            if (section && (section === 'contact' || apiRef.current.pose.progress > 0.98)) return section;
            object = object.parent;
          }
          return handles.includes(hit.object) ? 'toggle' : null;
        };
        rayHandler = (event) => {
          if (!event.isPrimary || event.button !== 0) return;
          const action = actionAt(event);
          if (action === 'toggle') onToggle();
          else if (action) onSelectFolder?.(action);
        };
        cursorHandler = (event) => { renderer.domElement.style.cursor = actionAt(event) ? 'pointer' : 'default'; };
        renderer.domElement.addEventListener('pointerup', rayHandler);
        renderer.domElement.addEventListener('pointermove', cursorHandler);
        lostHandler = () => { if (alive) onReady(false, 'fallback'); };
        restoredHandler = () => { if (alive) { invalidate(); onReady(true); } };
        renderer.domElement.addEventListener('webglcontextlost', lostHandler);
        renderer.domElement.addEventListener('webglcontextrestored', restoredHandler);
        host.dataset.meshCount = String(meshCount); host.dataset.status = 'ready';
        invalidate(); setLoaded(true); onReady(true);
      } catch (error) {
        if (!alive || error.name === 'AbortError') return;
        host.dataset.status = 'fallback';
        onReady(false, 'fallback');
        // The poster is a render of this same scene, retained for unsupported devices.
        console.warn('Archive scene could not be displayed:', error.message);
      }
    }
    setup();
    return () => {
      alive = false; abort.abort(); cancelAnimationFrame(frame);
      observer?.disconnect(); visibility?.disconnect();
      if (apiRef.current) {
        apiRef.current.animation?.kill();
        gsap.killTweensOf([apiRef.current.drawer.position, apiRef.current.pose]);
      }
      apiRef.current = null;
      if (renderer) {
        renderer.domElement.removeEventListener('pointerup', rayHandler);
        renderer.domElement.removeEventListener('pointermove', cursorHandler);
        renderer.domElement.removeEventListener('webglcontextlost', lostHandler);
        renderer.domElement.removeEventListener('webglcontextrestored', restoredHandler);
      }
      if (scene) disposeObject(scene);
      environment?.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    };
  }, { scope: hostRef });

  useGSAP(() => {
    const api = apiRef.current;
    if (!api || !loaded) return;
    hostRef.current.dataset.requestedOpen = String(open);
    const target = open ? 0.68 : 0.34;
    const phase = open ? 1 : 0;
    api.animation?.kill();
    if (Math.abs(api.drawer.position.z - target) < 0.0001 && Math.abs(api.pose.progress - phase) < 0.0001) {
      onTransitionEnd?.(open);
      return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeline = gsap.timeline({
      onUpdate: () => {
        hostRef.current.dataset.drawerPosition = api.drawer.position.z.toFixed(3);
        api.invalidate();
      },
      onComplete: () => onTransitionEnd?.(open),
    });
    timeline.to(api.pose, { progress: phase, duration: reduced ? 0 : open ? 2.1 : 1.7, ease: 'power3.inOut', overwrite: 'auto' }, 0);
    timeline.to(api.drawer.position, { z: target, duration: reduced ? 0 : 1.35, ease: 'power2.inOut', overwrite: 'auto' }, reduced ? 0 : open ? 0.35 : 0);
    api.animation = timeline;
    return () => timeline.kill();
  }, { scope: hostRef, dependencies: [open, loaded] });

  return <div ref={hostRef} className="archive-canvas" data-status="loading" />;
}
