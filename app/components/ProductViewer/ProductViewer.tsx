// "use client";
// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { motion } from 'framer-motion';
// import debounce from 'lodash.debounce';

// interface ProductViewerProps {
//     modelPath: string;
//     title: string;
//     onLoaded?: () => void;
// }

// // LRU Cache implementation for models
// class ModelCache {
//     private cache: Map<string, THREE.Group>;
//     private maxSize: number;

//     constructor(maxSize: number = 10) {
//         this.cache = new Map();
//         this.maxSize = maxSize;
//     }

//     get(key: string): THREE.Group | undefined {
//         const value = this.cache.get(key);
//         if (value) {
//             // Refresh key
//             this.cache.delete(key);
//             this.cache.set(key, value);
//         }
//         return value;
//     }

//     set(key: string, value: THREE.Group): void {
//         if (this.cache.size >= this.maxSize) {
//             // Remove least recently used item
//             const firstKey = this.cache.keys().next().value;
//             if (firstKey !== undefined) {
//                 this.cache.delete(firstKey);
//             }
//         }
//         this.cache.set(key, value);
//     }

//     clear(): void {
//         this.cache.forEach(model => {
//             model.traverse(object => {
//                 if (object instanceof THREE.Mesh) {
//                     object.geometry?.dispose();
//                     object.material?.dispose();
//                 }
//             });
//         });
//         this.cache.clear();
//     }
// }

// const modelCache = new ModelCache(5); // Keep 5 most recent models

// const ProductViewer: React.FC<ProductViewerProps> = ({ modelPath, title, onLoaded }) => {
//     const mountRef = useRef<HTMLDivElement | null>(null);
//     const sceneRef = useRef<THREE.Scene | null>(null);
//     const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
//     const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
//     const modelRef = useRef<THREE.Group | null>(null);
//     const animationRef = useRef<number | null>(null);
//     const isMountedRef = useRef(false);

//     const [isLoading, setIsLoading] = useState(true);
//     const [loadProgress, setLoadProgress] = useState(0);
//     const [error, setError] = useState<string | null>(null);

//     // Initialize Three.js scene
//     const initScene = useCallback(() => {
//         if (!mountRef.current) return;

//         // Cleanup previous scene if exists
//         if (sceneRef.current) {
//             sceneRef.current.traverse(object => {
//                 if (object instanceof THREE.Mesh) {
//                     object.geometry?.dispose();
//                     object.material?.dispose();
//                 }
//             });
//         }

//         // Create new scene
//         sceneRef.current = new THREE.Scene();
//         sceneRef.current.background = new THREE.Color(0xf5f5f5);

//         // Camera setup
//         cameraRef.current = new THREE.PerspectiveCamera(
//             45,
//             mountRef.current.clientWidth / mountRef.current.clientHeight,
//             0.1,
//             1000
//         );
//         cameraRef.current.position.z = 5;

//         // Renderer setup
//         if (rendererRef.current) {
//             rendererRef.current.dispose();
//         }

//         rendererRef.current = new THREE.WebGLRenderer({
//             antialias: true,
//             alpha: true,
//             powerPreference: "high-performance"
//         });
//         rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         rendererRef.current.setSize(
//             mountRef.current.clientWidth,
//             mountRef.current.clientHeight
//         );
//         mountRef.current.appendChild(rendererRef.current.domElement);

//         // Lighting
//         const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//         sceneRef.current.add(ambientLight);

//         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//         directionalLight.position.set(1, 1, 1);
//         sceneRef.current.add(directionalLight);

//         const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
//         backLight.position.set(-1, -1, -1);
//         sceneRef.current.add(backLight);
//     }, []);

//     // Configure loaded model
//     const setupModel = useCallback((model: THREE.Group) => {
//         if (!sceneRef.current) return;

//         // Remove previous model
//         if (modelRef.current) {
//             sceneRef.current.remove(modelRef.current);
//             modelRef.current.traverse(object => {
//                 if (object instanceof THREE.Mesh) {
//                     object.geometry?.dispose();
//                     object.material?.dispose();
//                 }
//             });
//         }

//         // Scale and center model
//         const box = new THREE.Box3().setFromObject(model);
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         const scaleFactor = 2.0 / maxDim;
//         model.scale.set(scaleFactor, scaleFactor, scaleFactor);

//         const center = box.getCenter(new THREE.Vector3());
//         model.position.sub(center);
//         model.rotation.y = Math.PI / 4;

//         sceneRef.current.add(model);
//         modelRef.current = model;

//         setIsLoading(false);
//         setError(null);
//         onLoaded?.();
//     }, [onLoaded]);

//     // Load model with caching
//     const loadModel = useCallback(async () => {
//         if (!sceneRef.current || !isMountedRef.current) return;

//         setIsLoading(true);
//         setLoadProgress(0);
//         setError(null);

//         try {
//             // Check cache first
//             const cachedModel = modelCache.get(modelPath);
//             if (cachedModel) {
//                 setupModel(cachedModel.clone());
//                 return;
//             }

//             // Load new model
//             const loader = new GLTFLoader();
//             loader.load(
//                 modelPath,
//                 (gltf) => {
//                     if (!isMountedRef.current) return;
//                     const model = gltf.scene;
//                     modelCache.set(modelPath, model.clone());
//                     setupModel(model);
//                 },
//                 (xhr) => {
//                     if (isMountedRef.current) {
//                         setLoadProgress((xhr.loaded / xhr.total) * 100);
//                     }
//                 },
//                 (error) => {
//                     if (isMountedRef.current) {
//                         console.error('Error loading model:', error);
//                         setError('Failed to load 3D model');
//                         setIsLoading(false);
//                         onLoaded?.();
//                     }
//                 }
//             );
//         } catch (err) {
//             console.error('Model loading error:', err);
//             setError('Error loading model');
//             setIsLoading(false);
//             onLoaded?.();
//         }
//     }, [modelPath, setupModel, onLoaded]);

//     // Animation loop
//     const animate = useCallback(() => {
//         if (!sceneRef.current || !cameraRef.current || !rendererRef.current) {
//             return;
//         }

//         if (modelRef.current && !isDragging.current) {
//             modelRef.current.rotation.y += 0.005;
//         }

//         rendererRef.current.render(sceneRef.current, cameraRef.current);
//         animationRef.current = requestAnimationFrame(animate);
//     }, []);

//     // Interaction handlers
//     const isDragging = useRef(false);
//     const previousMousePosition = useRef({ x: 0, y: 0 });

//     const handleMouseDown = useCallback((event: MouseEvent) => {
//         isDragging.current = true;
//         previousMousePosition.current = {
//             x: event.clientX,
//             y: event.clientY
//         };
//     }, []);

//     const handleMouseMove = useCallback((event: MouseEvent) => {
//         if (!isDragging.current || !modelRef.current) return;

//         const deltaMove = {
//             x: event.clientX - previousMousePosition.current.x,
//             y: event.clientY - previousMousePosition.current.y
//         };

//         modelRef.current.rotation.y += deltaMove.x * 0.01;
//         modelRef.current.rotation.x += deltaMove.y * 0.01;

//         previousMousePosition.current = {
//             x: event.clientX,
//             y: event.clientY
//         };
//     }, []);

//     const handleMouseUp = useCallback(() => {
//         isDragging.current = false;
//     }, []);

//     // Touch event handlers
//     const handleTouchStart = useCallback((event: TouchEvent) => {
//         if (event.touches.length === 1) {
//             isDragging.current = true;
//             previousMousePosition.current = {
//                 x: event.touches[0].clientX,
//                 y: event.touches[0].clientY
//             };
//         }
//     }, []);

//     const handleTouchMove = useCallback((event: TouchEvent) => {
//         if (!isDragging.current || !modelRef.current || event.touches.length !== 1) return;

//         const deltaMove = {
//             x: event.touches[0].clientX - previousMousePosition.current.x,
//             y: event.touches[0].clientY - previousMousePosition.current.y
//         };

//         modelRef.current.rotation.y += deltaMove.x * 0.01;
//         modelRef.current.rotation.x += deltaMove.y * 0.01;

//         previousMousePosition.current = {
//             x: event.touches[0].clientX,
//             y: event.touches[0].clientY
//         };
//         event.preventDefault();
//     }, []);

//     const handleTouchEnd = useCallback(() => {
//         isDragging.current = false;
//     }, []);

//     // Handle window resize
//     const handleResize = useCallback(() => {
//         if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

//         const width = mountRef.current.clientWidth;
//         const height = mountRef.current.clientHeight;

//         cameraRef.current.aspect = width / height;
//         cameraRef.current.updateProjectionMatrix();
//         rendererRef.current.setSize(width, height);
//         cameraRef.current.position.z = width < 768 ? 7 : 5;
//     }, []);

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     const debouncedResize = useCallback(debounce(handleResize, 100), [handleResize]);

//     // Setup and cleanup
//     useEffect(() => {
//         isMountedRef.current = true;
//         initScene();
//         loadModel();
//         animate();

//         // Event listeners
//         window.addEventListener('resize', debouncedResize);
//         window.addEventListener('mousedown', handleMouseDown);
//         window.addEventListener('mousemove', handleMouseMove);
//         window.addEventListener('mouseup', handleMouseUp);
//         window.addEventListener('touchstart', handleTouchStart);
//         window.addEventListener('touchmove', handleTouchMove, { passive: false });
//         window.addEventListener('touchend', handleTouchEnd);

//         return () => {
//             isMountedRef.current = false;

//             // Cleanup animation
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }

//             // Cleanup Three.js resources
//             if (rendererRef.current && mountRef.current) {
//                 // eslint-disable-next-line react-hooks/exhaustive-deps
//                 mountRef.current.removeChild(rendererRef.current.domElement);
//                 rendererRef.current.dispose();
//             }

//             if (sceneRef.current) {
//                 sceneRef.current.traverse(object => {
//                     if (object instanceof THREE.Mesh) {
//                         object.geometry?.dispose();
//                         object.material?.dispose();
//                         if (Array.isArray(object.material)) {
//                             object.material.forEach(m => m.dispose());
//                         } else {
//                             object.material?.dispose();
//                         }
//                     }
//                 });
//             }

//             // Remove event listeners
//             window.removeEventListener('resize', debouncedResize);
//             window.removeEventListener('mousedown', handleMouseDown);
//             window.removeEventListener('mousemove', handleMouseMove);
//             window.removeEventListener('mouseup', handleMouseUp);
//             window.removeEventListener('touchstart', handleTouchStart);
//             window.removeEventListener('touchmove', handleTouchMove);
//             window.removeEventListener('touchend', handleTouchEnd);
//         };
//     }, [initScene, animate, debouncedResize, handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, loadModel]);

//     // Reload model when path changes
//     useEffect(() => {
//         if (isMountedRef.current) {
//             loadModel();
//         }
//     }, [modelPath, loadModel]);

//     return (
//         <div className="relative w-full h-full">
//             {/* Canvas container */}
//             <motion.div
//                 className="w-full h-full"
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.3 }}
//                 ref={mountRef}
//                 aria-label="3D product viewer"
//             />

//             {/* Loading state */}
//             {isLoading && (
//                 <div
//                     role="status"
//                     aria-live="polite"
//                     aria-busy="true"
//                     className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10"
//                 >
//                     <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
//                     <p className="text-gray-700 font-medium">
//                         Loading {title}... {Math.round(loadProgress)}%
//                     </p>
//                 </div>
//             )}

//             {/* Error state */}
//             {error && (
//                 <div
//                     role="alert"
//                     className="absolute inset-0 flex items-center justify-center bg-red-50/80 z-10 p-4"
//                 >
//                     <p className="text-red-600 font-medium">{error}</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProductViewer;
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
        // Wrap loader.load in a try-catch
        try {
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
        } catch (error) {
            console.error('Failed to load model:', error);
            setIsLoading(false);
            if (onLoaded) onLoaded(); // Consider whether to call this on error
        }

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
                // eslint-disable-next-line react-hooks/exhaustive-deps
                const mountRefCurrent = mountRef.current;
                mountRefCurrent.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            // In your cleanup function:
            if (sceneRef.current) {
                sceneRef.current.traverse(object => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry?.dispose();
                        object.material?.dispose();
                    }
                });
            }
            if (cameraRef.current) {
                // Remove camera if needed
            }

            modelCache.clear();
            // Remove event listeners
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
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
                <div
                    role='status'
                    aria-live="polite"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
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