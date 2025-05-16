"use client"
import React, { useState } from "react";
import ProductViewer from "../ProductViewer/page";
import { products } from '@/app/data/product';
import ProductInfo from "../ProductInfo/page";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Heart,
    Package,
    Plus,
    Minus,
} from 'lucide-react';

const Main = () => {
    const [activeProductIndex, setActiveProductIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true); // New loading state

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const handleNext = () => {
        if (isLoading) return;
        setActiveProductIndex(prev => Math.min(products.length - 1, prev + 1));
        setIsLoading(true); // Trigger loading when changing products
    };

    const handlePrev = () => {
        if (isLoading) return;
        setActiveProductIndex(prev => Math.max(0, prev - 1));
        setIsLoading(true); // Trigger loading when changing products
    };

    return (
        <div className="flex flex-col items-center w-full bg-gradient-to-b from-blue-50 to-indigo-100 min-h-screen overflow-hidden relative">
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

            {/* Main Content Container */}
            <div className="flex flex-col items-center w-full max-w-6xl px-4 pb-20">
                {/* Product Viewer with Loading State */}
                <div className="relative w-full lg:w-[500px] aspect-square rounded-lg shadow-lg bg-white overflow-hidden mt-10">
                    <ProductViewer
                        modelPath={products[activeProductIndex].modelPath}
                        title={products[activeProductIndex].title}
                        onLoaded={() => setIsLoading(false)} // Callback when model loads
                    />

                    {/* Overlay Loading Spinner */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Slider Controls - Positioned on the sides */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isLoading}
                            onClick={handlePrev}
                            className={`pointer-events-auto p-2 rounded-full bg-white/80 shadow-md ${isLoading ? 'opacity-50' : 'hover:bg-white'}`}
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isLoading}
                            onClick={handleNext}
                            className={`pointer-events-auto p-2 rounded-full bg-white/80 shadow-md ${isLoading ? 'opacity-50' : 'hover:bg-white'}`}
                        >
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                        </motion.button>
                    </div>

                    {/* Dots Indicator - Bottom Center */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                        {products.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (!isLoading) {
                                        setActiveProductIndex(idx);
                                        setIsLoading(true);
                                    }
                                }}
                                className={`w-3 h-3 rounded-full transition-all ${idx === activeProductIndex ? 'bg-blue-500 scale-125' : 'bg-gray-300'} ${isLoading ? 'opacity-50' : ''}`}
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <ProductInfo
                    description={products[activeProductIndex].description}
                    title={products[activeProductIndex].title}
                    price={products[activeProductIndex].price}
                />

                {/* Quantity Selector */}
                <div className="mt-6 flex gap-4 items-center justify-center">
                    <h3 className="text-gray-800 font-medium">Quantity:</h3>
                    <div className="flex items-center">
                        <button
                            onClick={decrementQuantity}
                            disabled={isLoading}
                            className={`p-1 border border-gray-300 rounded-l-md ${isLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}
                        >
                            <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className={`w-12 text-center py-1 border-t border-b border-gray-300 ${isLoading ? 'opacity-50' : ''}`}>
                            <span className="text-lg text-black">{quantity}</span>
                        </div>
                        <button
                            onClick={incrementQuantity}
                            disabled={isLoading}
                            className={`p-1 border border-gray-300 rounded-r-md ${isLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}
                        >
                            <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 w-full max-w-md">
                    <div className="flex space-x-3">
                        <motion.button
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                            disabled={isLoading}
                            className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${isLoading ? 'opacity-50' : 'hover:bg-blue-700'}`}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {isLoading ? 'Loading...' : 'Add to Cart'}
                        </motion.button>
                        <motion.button
                            whileHover={!isLoading ? { scale: 1.05 } : {}}
                            whileTap={!isLoading ? { scale: 0.95 } : {}}
                            disabled={isLoading}
                            className={`bg-gray-200 text-gray-800 p-2 rounded-lg transition-colors ${isLoading ? 'opacity-50' : 'hover:bg-gray-300'}`}
                        >
                            <Heart className="w-4 h-4" />
                        </motion.button>
                    </div>
                    <p className="text-green-600 text-xs my-4 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        In stock - ships within 24 hours
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Main;