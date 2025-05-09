import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const ProductViewer: React.FC = () => {
    // Specify the type of the ref as HTMLDivElement
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
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
        camera.position.z = 5;

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
        const loader = new GLTFLoader();

        // Path is relative to the public folder
        loader.load(
            '/models/scene.gltf',
            (gltf: GLTF) => {
                model = gltf.scene;

                // Center the model
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);

                // Add the model to our scene
                scene.add(model);
            },
            (progress: { loaded: number; total: number }) => {
                console.log('Loading progress: ', (progress.loaded / progress.total) * 100, '%');
            },
            (error: Error) => {
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
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
    );
};

export default ProductViewer;