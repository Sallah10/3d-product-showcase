"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';

interface ProductViewerProps {
    modelPath: string;
    title: string;
    onLoaded?: () => void; // Callback when model loads
}
// , title
const ProductViewer: React.FC<ProductViewerProps> = ({ modelPath, onLoaded }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1500);
        if (!mountRef.current) return;

        // 1. Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        // 2. Responsive Camera
        const camera = new THREE.PerspectiveCamera(
            45,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        // 4. Lighting
        const frontLight = new THREE.DirectionalLight(0xffffff, 1);
        frontLight.position.set(0, 0, 1);
        scene.add(frontLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // 5. Model Loading with Auto-Scaling
        let model: THREE.Group;
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf: GLTF) => {
                if (onLoaded) onLoaded();
                model = gltf.scene;

                // Calculate bounding box and scale uniformly
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scaleFactor = 2.0 / maxDim;

                model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // Center the model
                box.setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                scene.add(model);
            },
            undefined,
            (error) => console.error('Error loading model:', error)
        );

        // 6. Mouse Controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const handleMouseDown = (event: MouseEvent) => {
            isDragging = true;
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDragging || !model) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            model.rotation.y += deltaMove.x * 0.01;
            model.rotation.x += deltaMove.y * 0.01;

            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // 7. Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging && model) {
                model.rotation.y += 0.005;
            }
            renderer.render(scene, camera);
        };
        animate();

        // 8. Responsive Handling
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);

            // Adjust for mobile
            camera.position.z = width < 768 ? 7 : 5;
        };

        window.addEventListener('resize', handleResize);
        const mountCurrent = mountRef.current;

        // 9. Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);

            if (mountCurrent && renderer.domElement) {

                mountCurrent.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [modelPath, onLoaded]);

    return (
        <div className='relative'>
            <motion.div
                className="lg:w-[500px] md:w-2/3 aspect-square rounded-lg shadow-lg overflow-hidden relative mt-10 mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                ref={mountRef}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {/* Loading overlay */}
                {/* {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600 font-medium">Loading {title}...</p>
                        </motion.div>
                    </motion.div>
                )} */}
            </motion.div>
        </div>
    );
};

export default ProductViewer;