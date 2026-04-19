"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { motion } from "framer-motion";
import { getCachedModel } from "@/app/utils/modelCache";

interface ProductViewerProps {
  modelPath: string;
  title: string;
  onLoaded?: () => void;
}

const ProductViewer: React.FC<ProductViewerProps> = ({
  modelPath,
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
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic color grading
    rendererRef.current.toneMappingExposure = 1.0;
    mountRef.current.appendChild(rendererRef.current.domElement);

    // Professional Studio Lighting (RoomEnvironment)
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
    controlsRef.current.enableZoom = false; // Prevents annoying page scroll on mobile
  };

  const loadModel = async () => {
    if (!sceneRef.current) return;

    try {
      const model = await getCachedModel(modelPath, (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          //   setLoadProgress((xhr.loaded / xhr.total) * 100);
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          if (percentComplete > 100) {
            setLoadProgress(99);
          } else {
            setLoadProgress(percentComplete);
          }
        } else {
          setLoadProgress((prev) => Math.min(prev + 5, 99));
        }
      });

      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
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

      setIsLoading(false);
      if (onLoaded) onLoaded();
    } catch (error) {
      console.error("Failed to load model:", error);
      setIsLoading(false);
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

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((m) => m.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }

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
          className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 backdrop-blur-sm"
        >
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-indigo-900 font-semibold animate-pulse">
            {loadProgress > 0
              ? `Loading ${title}... ${Math.round(loadProgress)}%`
              : `Preparing ${title}...`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductViewer;
