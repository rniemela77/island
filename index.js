// Import Three.js library
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light blue sky background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.5, 1.5); // Camera position adjusted to make it feel smaller

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Pointer Lock Controls for first-person movement
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
  controls.lock();
});

// Movement variables
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const moveSpeed = 2.5; // Reduced speed for a more small-scale effect
const dampingFactor = 0.15;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(1000, 1000); // Increased floor size for larger environment
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Green floor to represent grass
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Add Trees to the Scene
function addTree(x, z) {
  // Randomize trunk height, leaves size, and rotation for natural look
  const trunkHeight = THREE.MathUtils.randFloat(8, 12);
  const leavesHeight = THREE.MathUtils.randFloat(6, 10);
  const leavesRadius = THREE.MathUtils.randFloat(3, 5);
  const trunkRotation = THREE.MathUtils.randFloat(-0.1, 0.1);

  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, trunkHeight, 16);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, trunkHeight / 2, z);
  trunk.rotation.y = trunkRotation;
  trunk.castShadow = true;

  // Leaves
  const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 16);
  const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.set(0, trunkHeight / 2 + leavesHeight / 2, 0); // Adjusted to be relative to the trunk
  leaves.castShadow = true;

  // Add leaves to trunk
  trunk.add(leaves);
  scene.add(trunk);
}

// Create a dense forest by adding multiple trees
for (let i = -200; i <= 200; i += 8) { // Increased range and density of trees
  for (let j = -200; j <= 200; j += 8) {
    if (Math.random() > 0.2) { // Randomize tree placement for natural look
      const offsetX = THREE.MathUtils.randFloat(-4, 4);
      const offsetZ = THREE.MathUtils.randFloat(-4, 4);
      addTree(i + offsetX, j + offsetZ);
    }
  }
}

// Mobile-friendly controls using pointer events
let isPointerDown = false;
document.addEventListener('pointerdown', (event) => {
  if (controls.isLocked) {
    isPointerDown = true;
    event.preventDefault();
  }
});

document.addEventListener('pointerup', () => {
  isPointerDown = false;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    const delta = 0.05; // Reduced delta for smoother movement
    velocity.z -= velocity.z * dampingFactor;

    direction.z = isPointerDown ? 1 : 0;
    direction.normalize(); // Ensures consistent movement in all directions

    if (isPointerDown) velocity.z -= direction.z * moveSpeed * delta;

    controls.moveForward(-velocity.z * delta);
  }

  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
