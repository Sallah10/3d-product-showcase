// app/utils/modelCache.ts
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const loader = new GLTFLoader();

// DRACO decoder is self-hosted (public/draco) so we never depend on a third-party CDN.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
loader.setDRACOLoader(dracoLoader);

// Bump this whenever the model assets change. Static assets are cached by the
// browser at the same URL, so a stale cached copy could otherwise be served.
const ASSET_VERSION = "v3";

// Store in-flight promises instead of finished scenes so two callers loading the
// same path (e.g. a prefetch + the active viewer) never trigger a duplicate download.
const inflight = new Map<string, Promise<THREE.Group>>();

export const getCachedModel = (
  modelPath: string,
  onProgress?: (event: ProgressEvent) => void,
): Promise<THREE.Group> => {
  const assetUrl = `${modelPath}?${ASSET_VERSION}`;
  const existing = inflight.get(modelPath);
  if (existing) {
    return existing.then((model) => model.clone());
  }

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      assetUrl,
      (gltf) => resolve(gltf.scene),
      onProgress,
      (error) => {
        inflight.delete(modelPath);
        console.error("Error loading model:", error);
        reject(error);
      },
    );
  });

  inflight.set(modelPath, promise);
  return promise.then((model) => model.clone());
};