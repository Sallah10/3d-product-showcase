"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { motion } from "framer-motion";
import { getCachedModel } from "@/app/utils/modelCache";
import { getRandomFact, LOADING_MESSAGES } from "@/app/utils/loadingFacts";

interface ProductViewerProps {
  modelPath: string;
  title: string;
  onLoaded?: () => void;
}

const ProductViewer: React.FC<ProductViewerProps> = ({
  modelPath,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  onLoaded,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing"); // NEW: Better UX text
  const [currentFact, setCurrentFact] = useState<string>("");
  const factTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initScene = () => {
    if (!mountRef.current || sceneRef.current) return;

    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0xf5f5f5);

    cameraRef.current = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    cameraRef.current.position.set(0, 0, 5);

    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.toneMappingExposure = 1.0;
    mountRef.current.appendChild(rendererRef.current.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(rendererRef.current);
    sceneRef.current.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmremGenerator.dispose();

    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement,
    );
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.autoRotate = true;
    controlsRef.current.autoRotateSpeed = 2.0;
    controlsRef.current.enableZoom = false;
  };

  const loadModel = async () => {
    if (!sceneRef.current) return;

    // Set a random fact at the start of loading
    setCurrentFact(getRandomFact());

    // Start rotating facts every 5 seconds (user can hover to see different fact)
    if (factTimerRef.current) clearInterval(factTimerRef.current);
    factTimerRef.current = setInterval(() => {
      setCurrentFact(getRandomFact());
    }, 5000);

    // Track last update to throttle React renders
    let lastProgressUpdate = 0;

    try {
      setStatusText(LOADING_MESSAGES.downloading);
      const model = await getCachedModel(modelPath, (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);

          // THROTTLE: Only update React state every 5% to prevent freezing the main thread
          if (percentComplete - lastProgressUpdate >= 5 || percentComplete > 98) {
            setLoadProgress(Math.min(percentComplete, 99));
            lastProgressUpdate = percentComplete;
          }

          // UX FIX: Inform user that download is done, now we are parsing DRACO
          if (percentComplete >= 99) {
            setStatusText(LOADING_MESSAGES.decompressing);
          }
        }
      });

      setStatusText(LOADING_MESSAGES.processing);

      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
        // We DO NOT dispose geometries here because they are shared in the global cache.
      }

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 2.5 / maxDim;
      model.scale.setScalar(scaleFactor);
      model.position.sub(center.multiplyScalar(scaleFactor));

      sceneRef.current.add(model);
      modelRef.current = model;

      // Clean up the fact timer
      if (factTimerRef.current) clearInterval(factTimerRef.current);

      setIsLoading(false);
      if (onLoaded) onLoaded();
    } catch (error) {
      console.error("Failed to load model:", error);
      if (factTimerRef.current) clearInterval(factTimerRef.current);
      setIsLoading(false);
      setStatusText("Failed to load");
    }
  };

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    if (controlsRef.current) controlsRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };

  useEffect(() => {
    initScene();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (factTimerRef.current) clearInterval(factTimerRef.current);

      // SENIOR FIX: Removed the massive geometry/material dispose loop here.
      // Because we are using modelCache.ts, those materials must stay alive in memory.

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (controlsRef.current) controlsRef.current.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      setIsLoading(true);
      setLoadProgress(0);
      loadModel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]);

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        ref={mountRef}
      />

      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-white/90 z-10 backdrop-blur-sm"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8" />

          <div className="text-center max-w-sm px-6">
            <p className="text-indigo-900 font-semibold text-lg mb-2">
              {statusText}...
            </p>
            {loadProgress > 0 && (
              <div className="mb-6">
                <div className="w-full bg-indigo-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-indigo-700 text-sm font-medium">{loadProgress}% complete</p>
              </div>
            )}

            {currentFact && (
              <motion.div
                key={currentFact}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 rounded-lg p-4 mt-6 b shadow-md hover:shadow-lg transition-shadow"
              >
                <p className="text-indigo-900 text-sm leading-relaxed">{currentFact}</p>
                <p className="text-indigo-500 text-xs mt-3 font-medium">💡 Tip: Refreshing in 5 seconds...</p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductViewer;