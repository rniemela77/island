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
const moveSpeed = 5.0; // Reduced speed for smoother experience on mobile
const dampingFactor = 0.3; // Increased damping for smoother deceleration

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

// Handle touch events for mobile devices
const preventDefaultOptions = { passive: false };
document.addEventListener('touchstart', (event) => {
  isPointerDown = true;
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  event.preventDefault();
}, preventDefaultOptions);

document.addEventListener('touchmove', (event) => {
  if (isPointerDown) {
    const touch = event.touches[0];
    touchDeltaX = touch.clientX - touchStartX;
    touchDeltaY = touch.clientY - touchStartY;

    // Adjust camera rotation based on touch movement
    camera.rotation.y -= touchDeltaX * 0.004;
    
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    event.preventDefault();
  }
}, preventDefaultOptions);

document.addEventListener('touchend', () => {
  isPointerDown = false;
}, preventDefaultOptions);

// Desktop pointer controls
document.addEventListener('pointerdown', (event) => {
  isPointerDown = true;
  event.preventDefault();
}, preventDefaultOptions);

document.addEventListener('pointerup', () => {
  isPointerDown = false;
}, preventDefaultOptions);

// Animation loop with capped frame rate for mobile performance
let lastTime = 0;
function animate(time) {
  if (time - lastTime < 1000 / 45) { // 30 FPS cap for better performance on mobile
    requestAnimationFrame(animate);
    return;
  }
  lastTime = time;
  requestAnimationFrame(animate);

  const delta = 0.05; // Reduced delta for smoother movement
  velocity.z -= velocity.z * dampingFactor;

  direction.z = isPointerDown ? 1 : 0;
  direction.normalize();

  if (isPointerDown) velocity.z -= direction.z * moveSpeed * delta;

  camera.translateZ(velocity.z * delta); // Move the camera directly

  renderer.render(scene, camera);
}
animate(0);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
