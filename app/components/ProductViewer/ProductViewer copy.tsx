"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { motion } from "framer-motion";
import { getCachedModel } from "@/app/utils/modelCache"; // Use the shared cache

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
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimization for high-res screens
    rendererRef.current.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(rendererRef.current.domElement);

    // OrbitControls - FIXES MOBILE TOUCH AND MOUSE DRAGGING!
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement,
    );
    controlsRef.current.enableDamping = true; // Smooth physics
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.autoRotate = true; // Replaces manual rotation
    controlsRef.current.autoRotateSpeed = 2.0;
    controlsRef.current.enableZoom = false; // Prevents annoying page scrolling on mobile

    // Professional Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    sceneRef.current.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    sceneRef.current.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe0eaff, 0.4); // Slight blue tint for aesthetics
    fillLight.position.set(-5, 0, -5);
    sceneRef.current.add(fillLight);
  };

  const loadModel = async () => {
    if (!sceneRef.current) return;

    try {
      const model = await getCachedModel(modelPath, (xhr) => {
        // FIXED COUNTING MATH: Handle cases where total is 0
        if (xhr.lengthComputable && xhr.total > 0) {
          setLoadProgress((xhr.loaded / xhr.total) * 100);
        } else {
          // Fallback if server doesn't provide file size
          setLoadProgress((prev) => Math.min(prev + 5, 95));
        }
      });

      // Remove existing model to prevent overlaps
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
      }

      // Calculate optimal scale and center it
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 2.5 / maxDim; // Adjusted slightly for better framing
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

    if (controlsRef.current) {
      controlsRef.current.update(); // Required for damping and autoRotate
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

  useEffect(() => {
    initScene();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      // PROPER MEMORY DISPOSAL (Crucial for Hirable Portfolios)
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

  // Reload model when modelPath changes
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
