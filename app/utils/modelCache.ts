// utils/modelCache.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const modelCache = new Map<string, THREE.Group>();
const loader = new GLTFLoader();

export const getCachedModel = async (modelPath: string): Promise<THREE.Group> => {
  if (modelCache.has(modelPath)) {
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
      undefined,
      (error) => reject(error)
    );
  });
};