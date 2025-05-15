"use client"
import React from "react";
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
    //   RotateCcw
} from 'lucide-react';

const Main = () => {
    const [activeProductIndex, setActiveProductIndex] = React.useState(0);
    const [quantity, setQuantity] = React.useState(1);
    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    console.log(quantity)

    return (
        <div className="flex flex-col items-center w-full bg-gradient-to-b from-blue-50 to-indigo-100 min-h-screen overflow-hidden">
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


            <ProductViewer modelPath={products[activeProductIndex].modelPath} title={products[activeProductIndex].title} />


            {/* Slider Controls */}
            <div className="absolute bottom-[50%] left-1/2 -translate-x-1/2 flex gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    // disabled = {isLoading}
                    onClick={() => setActiveProductIndex(prev => Math.max(0, prev - 1))}
                >
                    {/* ← Previous */}
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
                <div className="flex space-x-1 mx-2">
                    {products.map((_, idx) => (
                        <span
                            key={idx}
                            className={`block w-2 h-2 rounded-full transition-all ${idx === activeProductIndex ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    //    disabled = {isLoading}
                    onClick={() => setActiveProductIndex(prev => Math.min(products.length - 1, prev + 1))}
                >
                    {/* Next → */}
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                </motion.button>
            </div>


            {/* Product Info */}
            <ProductInfo
                description={products[activeProductIndex].description}
                title={products[activeProductIndex].title}
                price={products[activeProductIndex].price}
            />


            {/*  Quantity Selector */}
            <div className="mt-6 flex gap-4 items-center justify-center">
                <h3 className="text-gray-800 font-medium mb-2 self-center">Quantity:</h3>
                <div className="flex items-center">
                    <button
                        onClick={decrementQuantity}
                        className="p-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                    >
                        <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-12 text-center py-1 border-t border-b border-gray-300 rounded-lg">
                        <h2 className="text-lg text-black ">{quantity}</h2>
                    </div>
                    <button
                        onClick={incrementQuantity}
                        className="p-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                    >
                        <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Add to Cart Button */}
            {/* Action buttons */}
            <div className="mt-4">
                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300 transition-colors"
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
    )
}

export default Main