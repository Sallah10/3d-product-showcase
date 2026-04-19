"use client";
import React, { Suspense, useState, useEffect } from "react";
import ProductViewer from "../ProductViewer/ProductViewer";
import { products } from "@/app/data/product";
import ProductInfo from "../ProductInfo/ProductInfo";
import { getCachedModel } from "@/app/utils/modelCache";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Package,
  Plus,
  Minus,
  Loader as LoadingSpinner,
  X,
  Trash2,
  CheckCircle,
} from "lucide-react";

interface CartItem {
  id: number;
  title: string;
  price: string;
  quantity: number;
}

const Main = () => {
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [preloadedModels, setPreloadedModels] = useState<boolean[]>([]);

  // E-commerce State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // NEW: Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // NEW: Like/Favorite State
  const [likedProducts, setLikedProducts] = useState<Set<number>>(new Set());

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleCheckout = () => {
    setIsCheckingOut(true);

    // Simulate an API call / Payment gateway processing
    setTimeout(() => {
      setIsCheckingOut(false);
      setIsCartOpen(false);
      setCart([]); // Clear the cart

      // Trigger Success Toast
      setToastMessage(`Payment successful! Your order is on the way.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }, 1500); // 1.5 second artificial delay
  };

  // NEW: Handle Like/Favorite
  const handleLike = () => {
    const product = products[activeProductIndex];
    const newLiked = new Set(likedProducts);

    if (newLiked.has(product.id)) {
      newLiked.delete(product.id);
      setToastMessage(`${product.title} removed from favorites!`);
    } else {
      newLiked.add(product.id);
      setToastMessage(`${product.title} added to favorites! ❤️`);
    }

    setLikedProducts(newLiked);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const preloadAllModels = async () => {
      const loadedStatus = await Promise.all(
        products.map(async (product) => {
          try {
            await getCachedModel(product.modelPath);
            return true;
          } catch {
            return false;
          }
        }),
      );
      setPreloadedModels(loadedStatus);
      setIsLoading(false);
    };
    preloadAllModels();
  }, []);

  const handleModelChange = (newIndex: number) => {
    if (isLoading) return;
    setQuantity(1);
    setIsLoading(true);
    setActiveProductIndex(newIndex);
  };

  const handleNext = () =>
    handleModelChange(Math.min(products.length - 1, activeProductIndex + 1));
  const handlePrev = () =>
    handleModelChange(Math.max(0, activeProductIndex - 1));

  const handleAddToCart = () => {
    const product = products[activeProductIndex];

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          quantity,
        },
      ];
    });

    // Trigger Animations and Toast
    setIsAdded(true);
    setToastMessage(`${quantity}x ${product.title} added to cart!`);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setIsAdded(false);
      setToastMessage(null);
    }, 3000);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const cartTotalAmount = cart.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace("$", ""));
    return total + numericPrice * item.quantity;
  }, 0);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="flex flex-col items-center w-full bg-gradient-to-b from-blue-50 to-indigo-100 min-h-screen relative overflow-hidden">
      {/* NEW: Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 border border-gray-700 w-max"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-medium text-sm md:text-base">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full py-6 px-4 bg-white shadow-md flex justify-between items-center relative z-30">
        <div className="w-10"></div>

        <motion.h1
          className="text-2xl md:text-3xl font-bold text-center text-indigo-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          3D Showcase
        </motion.h1>

        {/* Cart Icon - NOW ANIMATES WHEN ITEM ADDED */}
        <motion.button
          onClick={() => setIsCartOpen(true)}
          animate={
            isAdded
              ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
              : { scale: 1 }
          }
          transition={{ duration: 0.4 }}
          className="relative p-2 rounded-full hover:bg-indigo-50 transition-colors"
        >
          <ShoppingCart className="w-6 h-6 text-indigo-800" />
          {totalCartItems > 0 && (
            <motion.span
              key={totalCartItems} // Re-animates badge when count changes
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1"
            >
              {totalCartItems}
            </motion.span>
          )}
        </motion.button>
      </header>

      {/* --- REST OF THE COMPONENT REMAINS EXACTLY THE SAME AS PREVIOUS --- */}
      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Your Cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Package className="w-16 h-16 mb-4 opacity-50" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-indigo-600">
                          $
                          {(
                            parseFloat(item.price.replace("$", "")) *
                            item.quantity
                          ).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${cartTotalAmount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg flex justify-center items-center"
                  >
                    {isCheckingOut ? (
                      <>
                        <LoadingSpinner className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-6xl px-4 pb-20 mt-6">
        <Suspense fallback={<LoadingSpinner />}>
          <div className="relative w-full lg:w-[500px] aspect-square rounded-2xl shadow-xl bg-white overflow-hidden border border-gray-100">
            <ProductViewer
              modelPath={products[activeProductIndex].modelPath}
              title={products[activeProductIndex].title}
              onLoaded={() => setIsLoading(false)}
            />

            <div className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isLoading || activeProductIndex === 0}
                onClick={handlePrev}
                className={`pointer-events-auto p-2 rounded-full bg-white/90 shadow-md backdrop-blur-sm ${isLoading || activeProductIndex === 0 ? "opacity-30" : "hover:bg-white text-gray-800"}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={
                  isLoading || activeProductIndex === products.length - 1
                }
                onClick={handleNext}
                className={`pointer-events-auto p-2 rounded-full bg-white/90 shadow-md backdrop-blur-sm ${isLoading || activeProductIndex === products.length - 1 ? "opacity-30" : "hover:bg-white text-gray-800"}`}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isLoading) handleModelChange(idx);
                  }}
                  disabled={isLoading}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === activeProductIndex ? "bg-indigo-600 w-6" : "bg-gray-300"} ${isLoading ? "opacity-50" : ""}`}
                />
              ))}
            </div>
          </div>

          <ProductInfo
            description={products[activeProductIndex].description}
            title={products[activeProductIndex].title}
            price={products[activeProductIndex].price}
          />
        </Suspense>

        {/* E-Commerce Controls */}
        <div className="mt-8 flex flex-col gap-6 items-center w-full max-w-md">
          <div className="flex gap-4 items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-gray-500 font-medium px-2">Qty</span>
            <div className="flex items-center bg-gray-50 rounded-lg">
              <button
                onClick={decrementQuantity}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 text-center font-semibold text-gray-900">
                {quantity}
              </div>
              <button
                onClick={incrementQuantity}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex space-x-3 w-full">
            <motion.button
              onClick={handleAddToCart}
              whileHover={!isLoading && !isAdded ? { scale: 1.02 } : {}}
              whileTap={!isLoading && !isAdded ? { scale: 0.98 } : {}}
              disabled={isLoading || isAdded}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center transition-all duration-300 shadow-md
                            ${isLoading
                  ? "bg-indigo-300 text-white cursor-not-allowed"
                  : isAdded
                    ? "bg-green-500 text-white shadow-green-200/50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200/50"
                }`}
            >
              {isLoading ? (
                "Loading..."
              ) : isAdded ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              disabled={isLoading}
              animate={likedProducts.has(products[activeProductIndex].id) ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`p-3 border-2 rounded-xl shadow-sm transition-all duration-300 ${likedProducts.has(products[activeProductIndex].id)
                  ? "bg-pink-50 border-pink-300 text-pink-500 shadow-pink-200/50"
                  : "bg-white border-gray-200 text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-500"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart
                className="w-6 h-6"
                fill={likedProducts.has(products[activeProductIndex].id) ? "currentColor" : "none"}
              />
            </motion.button>
          </div>

          <p className="text-green-600 text-sm flex items-center justify-center font-medium bg-green-50 px-4 py-2 rounded-full">
            <Package className="w-4 h-4 mr-2" />
            In stock - ships within 24 hours
          </p>
        </div>
      </div>

      <footer className="w-full py-8 mt-auto border-t border-indigo-100 bg-white/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} 3D Product Showcase. All rights
            reserved.
          </p>
          <p className="mt-2 md:mt-0">
            Designed & Built by{" "}
            <a
              href="https://bello-muhammed.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sallah
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
