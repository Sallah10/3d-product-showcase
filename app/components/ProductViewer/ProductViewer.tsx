"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { motion } from "framer-motion";
import { Lightbulb, Play, Pause } from "lucide-react";
import { getCachedModel } from "@/app/utils/modelCache";
import { getRandomFact, LOADING_MESSAGES } from "@/app/utils/loadingFacts";

interface ProductViewerProps {
  modelPath: string;
  onLoaded?: () => void;
}

const ProductViewer: React.FC<ProductViewerProps> = ({
  modelPath,
  onLoaded,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const yawPivotRef = useRef<THREE.Group | null>(null);
  const pitchPivotRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing");
  const [currentFact, setCurrentFact] = useState<string>("");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const factTimerRef = useRef<NodeJS.Timeout | null>(null);

  const applyModelRotation = () => {
    if (yawPivotRef.current) yawPivotRef.current.rotation.y = yawRef.current;
    if (pitchPivotRef.current) pitchPivotRef.current.rotation.x = pitchRef.current;
  };

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

    // Safety net lights: guarantee the model is never pitch-black even if the
    // environment probe above somehow fails or is replaced.
    sceneRef.current.add(new THREE.AmbientLight(0xffffff, 0.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(3, 4, 5);
    sceneRef.current.add(keyLight);

    // Camera only zooms (wheel / pinch). Rotation is done by dragging the
    // model itself, so the product spins under your finger like you're
    // holding it in your hand.
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement,
    );
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.enableZoom = true;
    controlsRef.current.enablePan = false;
    controlsRef.current.enableRotate = false;
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 8;

    // Nested pivots: the outer one spins the model horizontally (yaw), the
    // inner one tilts it up/down (pitch), so you can flip it over to view the
    // underside just by dragging.
    yawPivotRef.current = new THREE.Group();
    pitchPivotRef.current = new THREE.Group();
    yawPivotRef.current.add(pitchPivotRef.current);
    sceneRef.current.add(yawPivotRef.current);
  };

  const loadModel = async () => {
    if (!sceneRef.current) return;

    // Set a random fact at the start of loading
    setCurrentFact(getRandomFact());

    // Start rotating facts every 5 seconds
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

          // UX: Inform user that download is done, now we are parsing DRACO
          if (percentComplete >= 99) {
            setStatusText(LOADING_MESSAGES.decompressing);
          }
        }
      });

      setStatusText(LOADING_MESSAGES.processing);

      if (modelRef.current) {
        pitchPivotRef.current?.remove(modelRef.current);
        // We DO NOT dispose geometries here because they are shared in the global cache.
      }

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 2.5 / maxDim;
      model.scale.setScalar(scaleFactor);
      model.position.sub(center.multiplyScalar(scaleFactor));

      pitchPivotRef.current?.add(model);
      modelRef.current = model;

      // Frame the new product straight-on
      yawRef.current = 0;
      pitchRef.current = 0;
      applyModelRotation();

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

    // Demo mode: slowly spin the model itself until the user grabs it.
    if (autoRotateRef.current && modelRef.current && !isDraggingRef.current) {
      yawRef.current -= 0.008;
      if (yawPivotRef.current) yawPivotRef.current.rotation.y = yawRef.current;
    }

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

  const handlePointerDown = (e: PointerEvent) => {
    if (!modelRef.current) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // The moment the user grabs the model, the demo spin stays off so they
    // can inspect it from any angle without the view being taken from them.
    autoRotateRef.current = false;
    setIsAutoRotating(false);

    if (e.target instanceof Element) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {
        // pointer not active; drag still works without capture
      }
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    yawRef.current += dx * 0.01;
    pitchRef.current += dy * 0.01;
    applyModelRotation();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  const toggleAutoRotate = () => {
    const next = !isAutoRotating;
    autoRotateRef.current = next;
    setIsAutoRotating(next);
  };

  useEffect(() => {
    initScene();
    window.addEventListener("resize", handleResize);
    animate();

    const domElement = rendererRef.current?.domElement;
    domElement?.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("resize", handleResize);
      domElement?.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (factTimerRef.current) clearInterval(factTimerRef.current);

      // The model geometry/materials live in the shared modelCache, so we must
      // NOT dispose them here when a product switch happens.

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

      {!isLoading && (
        <button
          onClick={toggleAutoRotate}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 shadow-md backdrop-blur-sm hover:bg-white text-indigo-700 transition"
          aria-label={
            isAutoRotating ? "Pause auto-rotate" : "Play auto-rotate"
          }
        >
          {isAutoRotating ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      )}

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
                <p className="text-indigo-700 text-sm font-medium">
                  {loadProgress}% complete
                </p>
              </div>
            )}

            {currentFact && (
              <motion.div
                key={currentFact}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="bg-white/95 rounded-xl px-5 py-4 mt-6 shadow-lg ring-1 ring-indigo-100 max-w-sm text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600">
                    <Lightbulb className="w-4 h-4" />
                  </span>
                  <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">
                    Did you know?
                  </p>
                </div>
                <p className="text-indigo-900 text-sm leading-relaxed">
                  {currentFact}
                </p>
                <p className="text-indigo-400 text-[11px] mt-3 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                  New tip in 5 seconds
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductViewer;