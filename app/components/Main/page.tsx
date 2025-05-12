"use client"
import React from "react";
import ProductViewer from "../ProductViewer/page";
import { products } from '@/app/data/product';
import ProductInfo from "../ProductInfo/page";
import { motion } from "framer-motion";

const Main = () => {
    const [activeProductIndex, setActiveProductIndex] = React.useState(0);
    return (
        <div className="flex flex-col items-center w-full bg-gradient-to-b from-blue-50 to-indigo-100 min-h-screen">
            <ProductViewer modelPath={products[activeProductIndex].modelPath} />
            {/* Slider Controls */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveProductIndex(prev => Math.max(0, prev - 1))}
                >
                    ← Previous
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveProductIndex(prev => Math.min(products.length - 1, prev + 1))}
                >
                    Next →
                </motion.button>
            </div>
            <ProductInfo
                description={products[activeProductIndex].description}
                title={products[activeProductIndex].title}
            />
            <motion.button
                className="mt-8 max-w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-800 transition-colors mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
            >
                Add to Cart
            </motion.button>
        </div>
    )
}

export default Main