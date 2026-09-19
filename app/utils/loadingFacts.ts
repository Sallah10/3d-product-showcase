// Honest, helpful tips shown while a 3D model loads. The overlay cycles through
// these every 5 seconds so visitors learn how to use the viewer (or something
// technical about it) instead of staring at a spinner.
export const LOADING_FACTS = [
  "Drag the product to spin it around — drag up or down to tilt it, and you can even flip it over to check the underside.",
  "Scroll or pinch anywhere on the model to zoom in and study the material details up close.",
  "The auto-rotation pauses the moment you grab the model, so you keep full control of the angle.",
  "Hit pause (⏸) to hold the current angle while you inspect, then play (▶) to let it rotate again.",
  "Use the arrows or the dots under the viewer to switch between the Air Sneaker Pro, the Sport Watch X and Blue Hills without leaving the page.",
  "These models are DRACO-compressed, cutting the total download from about 108 MB to under 29 MB — over 70% lighter.",
  "Models stay cached in memory after the first load, so switching products feels instant.",
  "Everything is rendered on your own GPU via WebGL in real time — nothing is pre-rendered video.",
  "The realistic reflections come from an image-based environment lit live inside your browser.",
  "The materials use physically-based values for realistic color, metalness and roughness.",
  "Built with Next.js, React, Three.js, DRACO and Framer Motion — server-rendered for a fast first paint.",
  "Lighting and shadows are recalculated every frame on your graphics card, which keeps the view silky smooth.",
];

export const LOADING_MESSAGES = {
  preparing: "Preparing viewer...",
  downloading: "Downloading 3D model...",
  decompressing: "Decompressing model data...",
  processing: "Processing 3D geometry...",
  rendering: "Setting up rendering...",
  complete: "Ready!",
};

export function getRandomFact(): string {
  return LOADING_FACTS[Math.floor(Math.random() * LOADING_FACTS.length)];
}