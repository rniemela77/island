import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Config Object
const config = {
  scene: {
    backgroundColor: 0x1b0e1e,
    fogColor: 0x1b0e1e,
    fogDensity: 0.3
  },
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 200,
    position: { x: 0, y: 0.5, z: 1.5 }
  },
  renderer: {
    antialias: false,
    powerPreference: 'low-power',
    pixelRatioCap: 1.5
  },
  controls: {
    moveSpeed: 5.0,
    dampingFactor: 0.3,
    frameRateCap: 15,
    touchSensitivity: 0.004
  },
  lighting: {
    ambient: { color: 0x1b0e1e, intensity: 0.001 },
    directional: { color: 0xffffff, intensity: 0.1, position: { x: 10, y: 10, z: 10 } }
  },
  floor: {
    geometry: { width: 100, height: 100 },
    material: { color: 0x3f5f3f }
  },
  trees: {
    trunk: { radiusTop: 0.3, radiusBottom: 0.6, height: 5, radialSegments: 4 },
    material: { color: 0x6b4f4f },
    count: 300,
    spread: 80,
    heightRange: { min: 3, max: 5 }
  }
};

// Adjust config for mobile
if (/Mobi|Android/i.test(navigator.userAgent)) {
  config.controls.moveSpeed = 2.5; // Reduce speed for mobile
  config.camera.far = 100; // Decrease far clipping plane
  config.trees.count = 300; // Reduce tree count
  config.renderer.pixelRatioCap = 1.0; // Lower pixel ratio for mobile
}

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(config.scene.backgroundColor);
scene.fog = new THREE.FogExp2(config.scene.fogColor, config.scene.fogDensity);

const camera = new THREE.PerspectiveCamera(config.camera.fov, config.camera.aspect, config.camera.near, config.camera.far);
camera.position.set(config.camera.position.x, config.camera.position.y, config.camera.position.z);

const renderer = new THREE.WebGLRenderer({ antialias: config.renderer.antialias, powerPreference: config.renderer.powerPreference });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.renderer.pixelRatioCap));
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);

// Lighting
const ambientLight = new THREE.AmbientLight(config.lighting.ambient.color, config.lighting.ambient.intensity);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(config.lighting.directional.color, config.lighting.directional.intensity);
directionalLight.position.set(config.lighting.directional.position.x, config.lighting.directional.position.y, config.lighting.directional.position.z);
scene.add(directionalLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(config.floor.geometry.width, config.floor.geometry.height, 1, 1);
const floorMaterial = new THREE.MeshBasicMaterial({ color: config.floor.material.color });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Trees
const trunkGeometry = new THREE.CylinderGeometry(config.trees.trunk.radiusTop, config.trees.trunk.radiusBottom, config.trees.trunk.height, config.trees.trunk.radialSegments);
const trunkMaterial = new THREE.MeshBasicMaterial({ color: config.trees.material.color });
const treeMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, config.trees.count);
for (let i = 0; i < config.trees.count; i++) {
  const x = THREE.MathUtils.randFloatSpread(config.trees.spread);
  const z = THREE.MathUtils.randFloatSpread(config.trees.spread);
  const trunkHeight = THREE.MathUtils.randFloat(config.trees.heightRange.min, config.trees.heightRange.max);
  const matrix = new THREE.Matrix4().makeTranslation(x, trunkHeight / 2, z);
  treeMesh.setMatrixAt(i, matrix);
}
scene.add(treeMesh);

// Touch Handler Object
const touchHandler = {
  isPointerDown: false,
  touchStartX: 0,
  handleTouchStart(e) {
    this.isPointerDown = true;
    this.touchStartX = e.touches[0].clientX;
  },
  handleTouchEnd() {
    this.isPointerDown = false;
  },
  handleTouchMove(e) {
    if (this.isPointerDown) {
      const deltaX = e.touches[0].clientX - this.touchStartX;
      camera.rotation.y -= deltaX * config.controls.touchSensitivity;
      this.touchStartX = e.touches[0].clientX;
      e.preventDefault();
    }
  }
};

// Attach consolidated touch events
document.addEventListener('touchstart', touchHandler.handleTouchStart.bind(touchHandler), { passive: false });
document.addEventListener('touchend', touchHandler.handleTouchEnd.bind(touchHandler), { passive: false });
document.addEventListener('touchmove', touchHandler.handleTouchMove.bind(touchHandler), { passive: false });

// Animation Loop
let lastTime = 0;
function animate(time) {
  if (document.hidden) {
    return requestAnimationFrame(animate);
  }
  if (time - lastTime < 1000 / config.controls.frameRateCap) return requestAnimationFrame(animate);
  lastTime = time;
  if (touchHandler.isPointerDown) camera.translateZ(-config.controls.moveSpeed * 0.05);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate(0);

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Visibility Change Event
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    animate(0);
  }
});
