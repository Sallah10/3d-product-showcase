"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';

// Type definitions
interface ProductViewerProps {
    modelPath: string;
    title: string;
    onLoaded?: () => void;
}

// Global cache for storing loaded models
const modelCache = new Map<string, THREE.Group>();

const ProductViewer: React.FC<ProductViewerProps> = ({ modelPath, title, onLoaded }) => {
    // Refs for Three.js objects and DOM elements
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const animationRef = useRef<number | null>(null);

    // State for loading status
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);

    // Initialize Three.js scene
    const initScene = () => {
        if (!mountRef.current) return;

        // Create scene with light gray background
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0xf5f5f5);

        // Set up camera with aspect ratio matching container
        cameraRef.current = new THREE.PerspectiveCamera(
            45, // Field of view
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        cameraRef.current.position.z = 5;

        // Create WebGL renderer with antialiasing
        rendererRef.current = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        rendererRef.current.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
        );
        mountRef.current.appendChild(rendererRef.current.domElement);

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        sceneRef.current.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(-1, -1, -1);
        sceneRef.current.add(backLight);
    };

    // Load 3D model with caching
    const loadModel = async () => {
        if (!sceneRef.current) return;

        // Check cache first
        if (modelCache.has(modelPath)) {
            const cachedModel = modelCache.get(modelPath)!.clone();
            setupModel(cachedModel);
            return;
        }

        // Load new model if not cached
        const loader = new GLTFLoader();

        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                modelCache.set(modelPath, model.clone()); // Cache the model
                setupModel(model);
            },
            (xhr) => {
                // Progress updates
                const progress = (xhr.loaded / xhr.total) * 100;
                setLoadProgress(progress);
            },
            (error) => {
                console.error('Error loading model:', error);
                setIsLoading(false);
            }
        );
    };

    // Configure model scale, position, and rotation
    const setupModel = (model: THREE.Group) => {
        if (!sceneRef.current) return;

        // Remove previous model if exists
        if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
        }

        // Calculate optimal scale to fit in view
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 2.0 / maxDim;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.rotation.y = Math.PI / 4; // Initial rotation angle

        // Add to scene and store reference
        sceneRef.current.add(model);
        modelRef.current = model;

        // Update loading state
        setIsLoading(false);
        if (onLoaded) onLoaded();
    };

    // Animation loop
    const animate = () => {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        // Rotate model slowly when not interacting
        if (modelRef.current && !isDragging) {
            modelRef.current.rotation.y += 0.005;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse interaction variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Handle window resize
    const handleResize = () => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);

        // Adjust camera for mobile
        cameraRef.current.position.z = width < 768 ? 7 : 5;
    };

    // Mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging || !modelRef.current) return;

        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        modelRef.current.rotation.y += deltaMove.x * 0.01;
        modelRef.current.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    };

    const handleMouseUp = () => {
        isDragging = false;
    };

    // Setup and cleanup
    useEffect(() => {
        // Initialize Three.js scene
        initScene();
        loadModel();
        animate();

        // Add event listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);



        return () => {
            // Cleanup Three.js resources
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            if (rendererRef.current && mountRef.current) {
                const mountRefCurrent = mountRef.current;
                mountRefCurrent.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            // Remove event listeners
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Reload model when modelPath changes
    useEffect(() => {
        if (sceneRef.current) {
            setIsLoading(true);
            setLoadProgress(0);
            loadModel();
        }
    }, [modelPath]);

    return (
        <div className="relative w-full h-full">
            {/* Container for Three.js canvas */}
            <motion.div
                className="w-full h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                ref={mountRef}
            />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-700 font-medium">
                        Loading {title}... {Math.round(loadProgress)}%
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductViewer;