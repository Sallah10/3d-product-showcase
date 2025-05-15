"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';




interface ProductViewerProps {
    modelPath: string;
}

const ProductViewer: React.FC<ProductViewerProps> = ({ modelPath }) => {
    // Specify the type of the ref as HTMLDivElement
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const [activeFeature, setActiveFeature] = useState<string | null>(null);

    // const features = [
    //     { id: 'feature1', name: 'Premium Materials', description: 'Made with high-quality sustainable materials' },
    //     { id: 'feature2', name: 'Ergonomic Design', description: 'Crafted for maximum comfort and usability' },
    //     { id: 'feature3', name: 'Smart Technology', description: 'Embedded sensors for enhanced performance' },
    // ];

    useEffect(() => {

        setTimeout(() => setIsLoading(false), 1500);

        // Make sure mountRef is available
        if (!mountRef.current) return;

        // STEP 1: CREATE THE BASIC ELEMENTS
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 2;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // STEP 2: ADD LIGHTS
        const frontLight = new THREE.DirectionalLight(0xffffff, 1);
        frontLight.position.set(0, 0, 1);
        scene.add(frontLight);

        const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
        topLight.position.set(0, 1, 0);
        scene.add(topLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // STEP 3: LOAD A 3D MODEL
        let model: THREE.Group | undefined;
        // scene.children = scene.children.filter(child => child.type !== 'Group');
        const loader = new GLTFLoader();
        // Path is relative to the public folder
        loader.load(
            // '/models/red_snickers/scene.gltf'
            modelPath,
            (gltf: GLTF) => {
                model = gltf.scene;

                // Center the model
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);
                const scaleFactor = 2.0; // Adjust this value to make it bigger or smaller
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                // Add the model to our scene
                scene.add(model);
            },
            (progress: { loaded: number; total: number }) => {
                console.log('Loading progress: ', (progress.loaded / progress.total) * 100, '%');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        // STEP 4: ADD MOUSE CONTROLS
        let isDragging = false;
        let previousMousePosition = {
            x: 0,
            y: 0
        };

        // When the mouse button is pressed down
        const handleMouseDown = (event: MouseEvent) => {
            isDragging = true;
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        };

        // When the mouse moves while button is pressed
        const handleMouseMove = (event: MouseEvent) => {
            if (!isDragging || !model) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            // Convert mouse movement to rotation
            model.rotation.y += deltaMove.x * 0.01;
            model.rotation.x += deltaMove.y * 0.01;

            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        };

        // When the mouse button is released
        const handleMouseUp = () => {
            isDragging = false;
        };

        // Add mouse event listeners
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // STEP 5: ANIMATION LOOP
        const animate = () => {
            requestAnimationFrame(animate);

            // Auto-rotate the model when not being dragged
            if (!isDragging && model) {
                model.rotation.y += 0.005;
            }

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resizing
        const handleResize = () => {
            if (!mountRef.current) return;
            // camera.aspect = window.innerWidth / window.innerHeight;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            // renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        const currentMountRef = mountRef.current;
        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (currentMountRef && renderer.domElement) {
                currentMountRef.removeChild(renderer.domElement);
            }
        };
    }, [modelPath]);

    return (
        <div className='relative' >
            <header className="w-full py-6 px-4 bg-white shadow-md">
                <motion.h1
                    className="text-3xl font-bold text-center text-indigo-800"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    3D Product Showcase
                </motion.h1>
            </header>
            {/* // <div ref={mountRef} style={{ width: '100%', height: '100vh' }} /> */}
            <motion.div
                className=" lg:w-[500px] md:w-2/3 aspect-square rounded-lg shadow-lg overflow-hidden relative mt-10 mx-auto"
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
            </motion.div>
        </div>
    );
};

export default ProductViewer;