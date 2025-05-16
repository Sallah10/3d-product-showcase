import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductInfoProps {
    title: string;
    description: string;
    price: string;
}
const ProductInfo: React.FC<ProductInfoProps> = ({ title, description, price }) => {
    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key={title} // Force re-animation when title changes
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                // fixed top-4 left-4
                className="bg-white p-6 gap-6 rounded-lg shadow-lg mt-6 hover:shadow-xl hover:bg-indigo-100 "
            >
                {/* <h2 className="font-bold text-lg text-indigo-600">{title}</h2>
                
                <p className="text-gray-600 text-sm">{description}</p> */}
                <h2 className="text-xl font-bold hover:text-blue-600  text-indigo-600">{title}</h2>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xl text-blue-600 font-semibold">{price}</p>
                    <div className="flex items-center justify-start ml-auto">
                        <div className="flex text-yellow-400">
                            <span>★★★★</span>
                            <span className="text-gray-300">★</span>
                        </div>
                        <span className="text-gray-600 text-sm ml-1">(42)</span>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-gray-600 text-sm">{description}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ProductInfo