// Import Three.js library
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
scene.add(sunLight);

// Floating island geometry - Updated Approach
const baseGeometry = new THREE.CylinderGeometry(6, 12, 2, 32);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = -6;
base.castShadow = true;
base.receiveShadow = true;
scene.add(base);

// Grass on top of the base
const topGeometry = new THREE.CylinderGeometry(6, 6, 1, 32);
const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const top = new THREE.Mesh(topGeometry, topMaterial);
top.position.y = -5;
top.castShadow = true;
top.receiveShadow = true;
scene.add(top);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
