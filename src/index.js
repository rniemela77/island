// Import Three.js library
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); // Darker color for a more intense atmosphere // Slightly brighter dark color for better visibility
scene.fog = new THREE.FogExp2(0x112233, 0.09); // Increase fog density for better performance by reducing draw distance

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500); // Reduce far plane for performance
camera.position.set(0, 0.5, 1.5); // Camera position adjusted to make it feel smaller

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' }); // Disable antialiasing and use low-power mode for better performance
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false; // Disable shadow maps for better performance on mobile
document.body.appendChild(renderer.domElement);

// Pointer Lock Controls for first-person movement
const controls = new PointerLockControls(camera, document.body);

// Movement variables
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const moveSpeed = 2.0; // Further reduce speed for a smoother experience on mobile
const dampingFactor = 0.25; // Increase damping for smoother deceleration

// Lighting
const ambientLight = new THREE.AmbientLight(0x101010, 0.001); // Further reduce ambient light for a darker environment // Further reduce ambient light for a darker environment // Reduced ambient light intensity for a darker environment // Reduce ambient light intensity for performance
scene.add(ambientLight);

// Add a point light to simulate camera illumination like a firefly
const cameraLight = new THREE.PointLight(0xffaa00, 0.005, 0.01); // Reduce light intensity and range for a much darker scene // Reduce light intensity and range for a much darker scene // Reduce light intensity and range for more darkness // Reduced intensity and range for a dimmer light // Further reduce intensity and range for better performance
cameraLight.position.set(0, 0, 0);
camera.add(cameraLight);
scene.add(cameraLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(200, 200, 5, 5); // Further reduce the size of the physical space // Reduce the size of the physical space // Further reduce segment count for better performance
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x3f5f3f }); // Use BasicMaterial for better performance
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Add Trees to the Scene
function addTree(x, z) {
  // Randomize trunk height, leaves size, and rotation for natural look
  const trunkHeight = THREE.MathUtils.randFloat(8, 25); // Increase trunk height for thicker trees // Reduce trunk height variation for simpler rendering
  const leavesHeight = THREE.MathUtils.randFloat(2, 8); // Lower the canopy height for a denser feeling forest // Increase leaves height for larger canopy // Reduce leaves height variation
  const leavesRadius = THREE.MathUtils.randFloat(3, 7); // Reduce the leaves radius for a tighter canopy // Increase leaves radius for a denser canopy // Reduce leaves radius variation
  const trunkRotation = THREE.MathUtils.randFloat(-0.05, 0.05); // Reduce rotation variation for performance

  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight, 8); // Make trunks thinner // Thicker and more detailed trunks // Further reduce geometry detail for performance
  const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x6b4f4f }); // Use BasicMaterial for better performance
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, trunkHeight / 2, z);
  trunk.rotation.y = trunkRotation;

  // Leaves
  const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 6); // Further reduce geometry detail for performance
  const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x1a4420 }); // Use BasicMaterial for better performance
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.set(0, trunkHeight / 2 + leavesHeight / 2, 0); // Adjusted to be relative to the trunk

  // Add leaves to trunk
  trunk.add(leaves);
  scene.add(trunk);
}

// Create a much denser forest by reducing tree spacing
for (let i = -80; i <= 80; i += 2) { // Decrease range and spacing for a smaller area with closer trees // Reduce range and spacing for a smaller area with closer trees // Increase spacing to make trees less close together // Decrease spacing to make trees closer together
  for (let j = -80; j <= 80; j += 2) { // Decrease range and spacing for a smaller area with closer trees // Reduce range and spacing for a smaller area with closer trees // Increase spacing to make trees less close together // Decrease spacing to make trees closer together
    if (Math.random() > 0.7) { // Further reduce the number of trees for a less dense forest // Reduce the number of trees for a less dense forest // Increase tree density for a denser forest
      const offsetX = THREE.MathUtils.randFloat(-1, 1);
      const offsetZ = THREE.MathUtils.randFloat(-1, 1);
      addTree(i + offsetX, j + offsetZ);
    }
  }
}

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
    camera.rotation.y -= touchDeltaX * 0.002;
    camera.rotation.x -= touchDeltaY * 0.002;

    // Clamp the vertical rotation to avoid flipping
    camera.rotation.x = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, camera.rotation.x));

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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = 0.05; // Reduced delta for smoother movement
  velocity.z -= velocity.z * dampingFactor;

  direction.z = isPointerDown ? 1 : 0;
  direction.normalize(); // Ensures consistent movement in all directions

  if (isPointerDown) velocity.z -= direction.z * moveSpeed * delta;

  camera.translateZ(velocity.z * delta); // Move the camera directly

  // Ensure camera light follows the camera position
  cameraLight.position.copy(camera.position);

  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
