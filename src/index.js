import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Config Object
const config = {
  scene: {
    backgroundColor: 0x010F4A, // Dark purple background
    fogColor: 0x060507, // Same as background for seamless transition
    fogDensity: 0.35 // Density for fog effect
  },
  camera: {
    fov: 95,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1, // eli5 - how close objects can be before they disappear
    far: 200,  // eli5 - how far objects can be before they disappear
    position: { x: 0, y: 0.5, z: 1.5 } 
  },
  renderer: {
    antialias: false, 
    powerPreference: 'low-power', 
    pixelRatioCap: 1.5 // Maximum pixel ratio for high-DPI displays
  },
  controls: {
    moveSpeed: 5.0,
    dampingFactor: 0.3,
    frameRateCap: 15,
    touchSensitivity: 0.004
  },
  floor: {
    geometry: { width: 100, height: 100 },
    material: { color: 0x1C291A }
  },
  trees: {
    trunk: { radiusTop: 0.3, radiusBottom: 0.6, height: 6, radialSegments: 3 },
    material: { color: 0x352C2C },
    count: 300,
    spread: 40,
    heightRange: { min: -1, max: 25 }
  },
  fireflies: {
    count: 100,
    color: 0xffff00, // Bright yellow for better visibility
    size: 0.2, // Smaller size for less intrusive appearance
    spread: 10,
    height: { min: -1, max: 6 },
    speed: 0.01, // Speed factor for movement
    pairProbability: 0.3 // Probability that a firefly moves in sync with another
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

// Floor
const floorGeometry = new THREE.PlaneGeometry(config.floor.geometry.width, config.floor.geometry.height, 1, 1);
const floorMaterial = new THREE.MeshBasicMaterial({ color: config.floor.material.color });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Trees
const trunkGeometry = new THREE.CylinderGeometry(config.trees.trunk.radiusTop, config.trees.trunk.radiusBottom, 1, config.trees.trunk.radialSegments); // Height set to 1, will be scaled
const trunkMaterial = new THREE.MeshBasicMaterial({ color: config.trees.material.color });
const treeMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, config.trees.count);

const leafGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 8); // Fat disc for leaves
const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x3f5f3f }); // Green color for leaves
const leafMesh = new THREE.InstancedMesh(leafGeometry, leafMaterial, config.trees.count);

for (let i = 0; i < config.trees.count; i++) {
  const x = THREE.MathUtils.randFloatSpread(config.trees.spread);
  const z = THREE.MathUtils.randFloatSpread(config.trees.spread);
  const trunkHeight = THREE.MathUtils.randFloat(config.trees.heightRange.min, config.trees.heightRange.max); // Random trunk height
  const trunkMatrix = new THREE.Matrix4().makeTranslation(x, trunkHeight / 2, z).scale(new THREE.Vector3(1, trunkHeight, 1));
  treeMesh.setMatrixAt(i, trunkMatrix);

  const leafMatrix = new THREE.Matrix4().makeTranslation(x, trunkHeight + 0.1, z); // Position leaves on top of the trunk
  leafMesh.setMatrixAt(i, leafMatrix);
}

scene.add(treeMesh);
scene.add(leafMesh);

// Fireflies
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyPositions = new Float32Array(config.fireflies.count * 3);
const fireflyPairs = new Array(config.fireflies.count).fill(false);

for (let i = 0; i < config.fireflies.count; i++) {
  fireflyPositions[i * 3] = THREE.MathUtils.randFloatSpread(config.fireflies.spread);
  fireflyPositions[i * 3 + 1] = THREE.MathUtils.randFloat(config.fireflies.height.min, config.fireflies.height.max);
  fireflyPositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(config.fireflies.spread);

  // Assign pairs with a certain probability
  if (Math.random() < config.fireflies.pairProbability) {
    fireflyPairs[i] = true;
  }
}

fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
const fireflyMaterial = new THREE.PointsMaterial({ color: config.fireflies.color, size: config.fireflies.size, transparent: true, opacity: 0.8, depthTest: true, blending: THREE.AdditiveBlending });
const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);

// Animation Loop for Fireflies
let timeOffset = 0;
function animateFireflies() {
  timeOffset += config.fireflies.speed;
  const positions = fireflyGeometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const pairOffset = fireflyPairs[i / 3] ? 0.5 : 1.0;
    positions[i] += Math.sin(timeOffset + i) * config.fireflies.speed * pairOffset; // Smooth horizontal movement
    positions[i + 1] += Math.sin(timeOffset * 0.5 + i) * config.fireflies.speed * 0.5; // Smooth vertical movement
    positions[i + 2] += Math.cos(timeOffset + i) * config.fireflies.speed * 0.5 * pairOffset; // Smooth depth movement
  }
  fireflyGeometry.attributes.position.needsUpdate = true;
}

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
  animateFireflies();
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
