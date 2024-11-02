// Import Three.js library
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b0e1e); // Dark background for spooky atmosphere
scene.fog = new THREE.FogExp2(0x1b0e1e, 0.3); // Lower fog density for performance

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200); // Reduce far plane for performance
camera.position.set(0, 0.5, 1.5);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' }); // Disable antialiasing and use low-power mode
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel density for mobile performance
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

// Pointer Lock Controls for first-person movement
const controls = new PointerLockControls(camera, document.body);

// Movement variables
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

// Centralized configuration object
const config = {
  moveSpeed: 5.0, // Reduced speed for smoother experience on mobile
  dampingFactor: 0.3, // Increased damping for smoother deceleration
  frameRateCap: 45, // Cap frame rate for mobile performance
  delta: 0.05, // Reduced delta for smoother movement
  touchSensitivity: 0.004, // Sensitivity for touch rotation
};

// Lighting
const ambientLight = new THREE.AmbientLight(0x1b0e1e, 0.001); // Very dim ambient light for spooky atmosphere
scene.add(ambientLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1); // Simplified floor geometry for performance
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x3f5f3f }); // Basic material for better performance
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Add Trees using Instanced Mesh for better performance
const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.6, 5, 6); // Reduced segments for performance
const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x6b4f4f });
const numTrees = 500;
const treeMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, numTrees);

for (let i = 0; i < numTrees; i++) {
  const x = THREE.MathUtils.randFloatSpread(80);
  const z = THREE.MathUtils.randFloatSpread(80);
  const trunkHeight = THREE.MathUtils.randFloat(3, 5);
  const matrix = new THREE.Matrix4().makeTranslation(x, trunkHeight / 2, z);
  treeMesh.setMatrixAt(i, matrix);
}
scene.add(treeMesh);

// Mobile-friendly controls using pointer events
let isPointerDown = false;
let touchStartX = 0;
let touchStartY = 0;
let touchDeltaX = 0;
let touchDeltaY = 0;

// Consolidated event handling functions
function handlePointerDown(event) {
  isPointerDown = true;
  touchStartX = event.touches ? event.touches[0].clientX : event.clientX;
  touchStartY = event.touches ? event.touches[0].clientY : event.clientY;
  event.preventDefault();
}

function handlePointerUp() {
  isPointerDown = false;
}

document.addEventListener('touchstart', handlePointerDown, { passive: false });
document.addEventListener('pointerdown', handlePointerDown, { passive: false });
document.addEventListener('touchend', handlePointerUp, { passive: false });
document.addEventListener('pointerup', handlePointerUp, { passive: false });

// Handle touch events for mobile devices
function handleTouchMove(event) {
  if (isPointerDown) {
    const touch = event.touches[0];
    touchDeltaX = touch.clientX - touchStartX;
    touchDeltaY = touch.clientY - touchStartY;

    if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
      camera.rotation.y -= touchDeltaX * config.touchSensitivity;
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    event.preventDefault();
  }
}

document.addEventListener('touchmove', handleTouchMove, { passive: false });

// Animation loop with capped frame rate for mobile performance
let lastTime = 0;
function updateMovement(delta) {
  velocity.z -= velocity.z * config.dampingFactor;
  direction.z = isPointerDown ? 1 : 0;
  direction.normalize();

  if (isPointerDown) velocity.z -= direction.z * config.moveSpeed * delta;

  camera.translateZ(velocity.z * delta); // Move the camera directly
}

function animate(time) {
  if (time - lastTime < 1000 / config.frameRateCap) {
    requestAnimationFrame(animate);
    return;
  }
  lastTime = time;
  requestAnimationFrame(animate);

  updateMovement(config.delta);
  renderer.render(scene, camera);
}
animate(0);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
