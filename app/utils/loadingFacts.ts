// Interesting facts and tips to show while 3D models load
// export const LOADING_FACTS = [
//   "🎨 3D models use DRACO compression, reducing file size by 80-90% compared to standard formats",
//   "🔄 Try rotating the model with your mouse or touch to see all angles",
//   "⚡ High-quality 3D rendering requires complex calculations for lighting and shadows",
//   "🎯 The environment lighting you see is rendered in real-time using advanced algorithms",
//   "📦 GLTF is the gold standard format for 3D web applications",
//   "🖥️ Your graphics card (GPU) is doing the heavy lifting to render this in real-time",
//   "🎬 This 3D viewer uses physically-based rendering for realistic materials",
//   "🔍 Zoom in to see the fine details and material imperfections that make it look real",
//   "💾 Models are cached after first load for faster subsequent views",
//   "🌟 Advanced antialiasing is being used to smooth out jagged edges",
//   "📱 3D rendering is adaptive - quality scales based on your device performance",
//   "🎪 Orbit controls let you inspect products from every angle effortlessly",
//   "🔊 The model includes complex geometry data that needs to be decompressed",
//   "✨ Real-time 3D rendering runs at 60 frames per second on your device",
//   "🎨 The materials use physically-accurate color and reflectivity values",
//   "🚀 Advanced optimizations ensure smooth performance even on mobile devices",
//   "🎯 Every pixel on screen is calculated in real-time for maximum interactivity",
// ];

export const LOADING_FACTS = [
  "3D models use DRACO compression, reducing file size by 80-90% compared to standard formats",
  "Try rotating the model with your mouse or touch to see all angles",
  "High-quality 3D rendering requires complex calculations for lighting and shadows",
  "The environment lighting you see is rendered in real-time using advanced algorithms",
  "GLTF is the gold standard format for 3D web applications",
  "Your graphics card (GPU) is doing the heavy lifting to render this in real-time",
  "This 3D viewer uses physically-based rendering for realistic materials",
  "Zoom in to see the fine details and material imperfections that make it look real",
  "Models are cached after first load for faster subsequent views",
  "Advanced antialiasing is being used to smooth out jagged edges",
  "3D rendering is adaptive - quality scales based on your device performance",
  "Orbit controls let you inspect products from every angle effortlessly",
  "The model includes complex geometry data that needs to be decompressed",
  "Real-time 3D rendering runs at 60 frames per second on your device",
  "The materials use physically-accurate color and reflectivity values",
  "Advanced optimizations ensure smooth performance even on mobile devices",
  "Every pixel on screen is calculated in real-time for maximum interactivity",
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
