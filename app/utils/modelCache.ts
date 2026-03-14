// app/utils/modelCache.ts
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const modelCache = new Map<string, THREE.Group>();

const loader = new GLTFLoader();

// Set up the DRACO Loader for highly optimized 3D model compression
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);
loader.setDRACOLoader(dracoLoader);

export const getCachedModel = async (
  modelPath: string,
  onProgress?: (event: ProgressEvent) => void,
): Promise<THREE.Group> => {
  if (modelCache.has(modelPath)) {
    if (onProgress) {
      onProgress({
        loaded: 100,
        total: 100,
        lengthComputable: true,
      } as ProgressEvent);
    }
    return modelCache.get(modelPath)!.clone();
  }

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelCache.set(modelPath, model);
        resolve(model.clone());
      },
      onProgress,
      (error) => {
        console.error("Error loading model:", error);
        reject(error);
      },
    );
  });
};
