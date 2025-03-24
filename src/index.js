import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { config } from "./config";

// Adjust config for mobile
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
if (isMobile) {
  config.controls.moveSpeed = 2.5; // Reduce speed for mobile
  config.camera.far = 100; // Decrease far clipping plane
  config.trees.count = 300; // Reduce tree count
  config.renderer.pixelRatioCap = 1.0; // Lower pixel ratio for mobile
}

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(config.scene.backgroundColor);
scene.fog = new THREE.FogExp2(config.scene.fogColor, config.scene.fogDensity);

// Create the camera
const camera = new THREE.PerspectiveCamera(
  config.camera.fov,
  config.camera.aspect,
  config.camera.near,
  config.camera.far
);
camera.position.set(
  config.camera.position.x,
  config.camera.position.y,
  config.camera.position.z
);

// Create the renderer
const renderer = new THREE.WebGLRenderer({
  antialias: config.renderer.antialias,
  powerPreference: config.renderer.powerPreference,
});
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, config.renderer.pixelRatioCap)
);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the light
// Create the light and attach it to the camera
const light = new THREE.PointLight(config.light.color, config.light.intensity);
camera.add(light);
scene.add(camera); // Re-add the camera after attaching the light

// Create controls (pc)
const controls = new PointerLockControls(camera, renderer.domElement);
controls.movementSpeed = config.controls.moveSpeed;
controls.lookSpeed = config.controls.dampingFactor;
scene.add(controls.getObject());

// Mouse movement and input variables
let isMovingForward = false;
let mouseX = 0;
let mouseY = 0;

// Instructions element for mouse controls
const blocker = document.createElement('div');
blocker.id = 'blocker';
blocker.style.position = 'absolute';
blocker.style.width = '100%';
blocker.style.height = '100%';
blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
blocker.style.display = 'flex';
blocker.style.justifyContent = 'center';
blocker.style.alignItems = 'center';
blocker.style.zIndex = '10';
blocker.style.color = 'white';
blocker.style.fontSize = '16px';
blocker.style.fontFamily = 'Arial, sans-serif';
blocker.innerHTML = '<div style="text-align:center; padding: 20px;">Click to start<br><small>Move with mouse, click to walk forward</small></div>';
document.body.appendChild(blocker);

// Mouse control implementation
blocker.addEventListener('click', function() {
  controls.lock();
});

controls.addEventListener('lock', function() {
  blocker.style.display = 'none';
});

controls.addEventListener('unlock', function() {
  blocker.style.display = 'flex';
  isMovingForward = false; // Reset movement when controls are unlocked
});

// Allow exiting pointer lock with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && controls.isLocked) {
    controls.unlock();
  }
});

// Mouse click to move forward
document.addEventListener('mousedown', function() {
  if (controls.isLocked) {
    isMovingForward = true;
  }
});

document.addEventListener('mouseup', function() {
  isMovingForward = false;
});

// Mouse movement
document.addEventListener('mousemove', function(event) {
  if (controls.isLocked) {
    mouseX = event.movementX || 0;
    mouseY = event.movementY || 0;
  }
});

// Floor
const floorMaterial = new THREE.MeshPhongMaterial({
  color: config.floor.material.color,
  shininess: 0, // Set shininess to zero for no specular reflections
});

const floorGeometry = new THREE.PlaneGeometry(
  config.floor.geometry.width,
  config.floor.geometry.height,
  1,
  1
);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floorMaterial.envMap = null; // Ensure no environment map is applied

floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Trees
const trunkGeometry = new THREE.CylinderGeometry(
  config.trees.trunk.radiusTop,
  config.trees.trunk.radiusBottom,
  1,
  config.trees.trunk.radialSegments
); // Height set to 1, will be scaled
const trunkMaterial = new THREE.MeshBasicMaterial({
  color: config.trees.material.color,
});
const treeMesh = new THREE.InstancedMesh(
  trunkGeometry,
  trunkMaterial,
  config.trees.count
);

const leafGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 8); // Fat disc for leaves
const leafMaterial = new THREE.MeshBasicMaterial({
  color: 0x3f5f3f, // Green color for leaves
  transparent: true, // Enable transparency
  opacity: 0.5, // Set opacity to 50%
});
const leafMesh = new THREE.InstancedMesh(
  leafGeometry,
  leafMaterial,
  config.trees.count
);

scene.add(leafMesh);

for (let i = 0; i < config.trees.count; i++) {
  const x = THREE.MathUtils.randFloatSpread(config.trees.spread);
  const z = THREE.MathUtils.randFloatSpread(config.trees.spread);
  const trunkHeight = THREE.MathUtils.randFloat(
    config.trees.heightRange.min,
    config.trees.heightRange.max
  ); // Random trunk height
  const trunkMatrix = new THREE.Matrix4()
    .makeTranslation(x, trunkHeight / 2, z)
    .scale(new THREE.Vector3(1, trunkHeight, 1));
  treeMesh.setMatrixAt(i, trunkMatrix);

  const leafMatrix = new THREE.Matrix4().makeTranslation(
    x,
    trunkHeight + 0.1,
    z
  ); // Position leaves on top of the trunk
  leafMesh.setMatrixAt(i, leafMatrix);
}

scene.add(treeMesh);
scene.add(leafMesh);

// Function to wrap the player when moving beyond certain boundaries
function wrapPosition(object) {
  const boundary = config.trees.spread / 2;
  const spread = config.trees.spread;

  if (object.position.x > boundary) {
    object.position.x -= spread;
    duplicateForest(object.position.x, object.position.z);
  }
  if (object.position.x < -boundary) {
    object.position.x += spread;
    duplicateForest(object.position.x, object.position.z);
  }
  if (object.position.z > boundary) {
    object.position.z -= spread;
    duplicateForest(object.position.x, object.position.z);
  }
  if (object.position.z < -boundary) {
    object.position.z += spread;
    duplicateForest(object.position.x, object.position.z);
  }
}

function duplicateForest(x, z) {
  // Create a new forest section at the given position
  const newForest = createForest();
  newForest.position.set(x, 0, z);
  scene.add(newForest);
}

function createForest() {
  const forest = new THREE.Group();
  for (let i = 0; i < config.trees.count; i++) {
    const tree = createTree();
    tree.position.set(
      Math.random() * config.trees.spread - config.trees.spread / 2,
      0,
      Math.random() * config.trees.spread - config.trees.spread / 2
    );
    forest.add(tree);
  }
  return forest;
}

function createTree() {
  const geometry = new THREE.CylinderGeometry(
    config.trees.trunk.radiusTop,
    config.trees.trunk.radiusBottom,
    config.trees.trunk.height,
    config.trees.trunk.radialSegments
  );
  const material = new THREE.MeshStandardMaterial({
    color: config.trees.material.color,
  });
  return new THREE.Mesh(geometry, material);
}

// Fireflies
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyPositions = new Float32Array(config.fireflies.count * 3);
const fireflyPairs = new Array(config.fireflies.count).fill(false);

for (let i = 0; i < config.fireflies.count; i++) {
  fireflyPositions[i * 3] = THREE.MathUtils.randFloatSpread(
    config.fireflies.spread
  );
  fireflyPositions[i * 3 + 1] = THREE.MathUtils.randFloat(
    config.fireflies.height.min,
    config.fireflies.height.max
  );
  fireflyPositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(
    config.fireflies.spread
  );

  // Assign pairs with a certain probability
  if (Math.random() < config.fireflies.pairProbability) {
    fireflyPairs[i] = true;
  }
}

fireflyGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(fireflyPositions, 3)
);
const fireflyMaterial = new THREE.PointsMaterial({
  color: config.fireflies.color,
  size: config.fireflies.size,
  transparent: true,
  opacity: 0.8,
  depthTest: true,
  blending: THREE.AdditiveBlending,
});
const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);

// Animation Loop for Fireflies
let timeOffset = 0;
function animateFireflies() {
  timeOffset += config.fireflies.speed;
  const positions = fireflyGeometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const pairOffset = fireflyPairs[i / 3] ? 0.5 : 1.0;
    positions[i] +=
      Math.sin(timeOffset + i) * config.fireflies.speed * pairOffset; // Smooth horizontal movement
    positions[i + 1] +=
      Math.sin(timeOffset * 0.5 + i) * config.fireflies.speed * 0.5; // Smooth vertical movement
    positions[i + 2] +=
      Math.cos(timeOffset + i) * config.fireflies.speed * 0.5 * pairOffset; // Smooth depth movement
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
  },
};

// Attach consolidated touch events
document.addEventListener(
  "touchstart",
  touchHandler.handleTouchStart.bind(touchHandler),
  { passive: false }
);
document.addEventListener(
  "touchend",
  touchHandler.handleTouchEnd.bind(touchHandler),
  { passive: false }
);
document.addEventListener(
  "touchmove",
  touchHandler.handleTouchMove.bind(touchHandler),
  { passive: false }
);

// Show appropriate controls based on device
if (isMobile) {
  blocker.innerHTML = '<div style="text-align:center; padding: 20px;">Tap to start<br><small>Touch and drag to look around<br>Touch and hold to move forward</small></div>';
} else {
  // On desktop, make touch controls work alongside mouse controls
  document.addEventListener('click', function() {
    if (!controls.isLocked) {
      controls.lock();
    }
  });
}

// Animation Loop
let lastTime = 0;
function animate(time) {
  if (document.hidden) {
    return requestAnimationFrame(animate);
  }
  if (time - lastTime < 1000 / config.controls.frameRateCap) {
    return requestAnimationFrame(animate);
  }
  lastTime = time;

  // Handle forward movement from touch and mouse
  if (touchHandler.isPointerDown || isMovingForward) {
    camera.translateZ(-config.controls.moveSpeed * 0.05);
  }

  // Add flickering effect to the light's intensity
  const flickerSpeed = 10; // Speed at which the light flickers
  const minIntensity = 4.5; // Minimum light intensity
  const maxIntensity = 5.0; // Maximum light intensity
  light.intensity =
    minIntensity +
    Math.random() *
      Math.sin(Date.now() * 0.005 * flickerSpeed) *
      (maxIntensity - minIntensity);

  // Update other animation elements
  animateFireflies();
  wrapPosition(camera);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate(0);

// Resize Handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let visibilityTimeout;
document.addEventListener("visibilitychange", () => {
  clearTimeout(visibilityTimeout);
  visibilityTimeout = setTimeout(() => {
    if (!document.hidden) {
      animate(0);
    }
  }, 100);
});