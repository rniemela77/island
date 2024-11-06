// Config Object
export const config = {
  scene: {
    backgroundColor: 0x010f4a, // Dark purple background
    fogColor: 0x060507, // Same as background for seamless transition
    fogDensity: 0.35, // Density for fog effect
  },
  camera: {
    fov: 95,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1, // eli5 - how close objects can be before they disappear
    far: 200, // eli5 - how far objects can be before they disappear
    position: { x: 0, y: 0.5, z: 1.5 },
  },
  renderer: {
    antialias: false,
    powerPreference: "low-power",
    pixelRatioCap: 1.5, // Maximum pixel ratio for high-DPI displays
  },
  controls: {
    moveSpeed: 5.0,
    dampingFactor: 0.3,
    frameRateCap: 15,
    touchSensitivity: 0.004,
  },
  floor: {
    geometry: { width: 100, height: 100 },
    material: { color: 0x1c291a },
  },
  trees: {
    trunk: { radiusTop: 0.3, radiusBottom: 0.6, height: 6, radialSegments: 3 },
    material: { color: 0x352c2c },
    count: 300,
    spread: 40,
    heightRange: { min: -1, max: 25 },
  },
  fireflies: {
    count: 100,
    color: 0xffff00, // Bright yellow for better visibility
    size: 0.2, // Smaller size for less intrusive appearance
    spread: 10,
    height: { min: -1, max: 6 },
    speed: 0.01, // Speed factor for movement
    pairProbability: 0.3, // Probability that a firefly moves in sync with another
  },
  light: {
    color: 0xffa358, // Orange-ish color
    intensity: 1.0, // Initial intensity
    position: { x: 0, y: 5, z: 2 }, // Position above the user
  },
};
