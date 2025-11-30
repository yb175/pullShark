"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function PullSharkAppPrompt({ isInstalled, installUrl }) {
  const [visible, setVisible] = useState(false);

  // Show popup only if app not installed
  useEffect(() => {
    if (!isInstalled) setVisible(true);
  }, [isInstalled]);

  return (
    <AnimatePresence>
      {!isInstalled && visible && (
        <>
          {/* Background Blur Layer */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* The Popup */}
          <motion.div
            className="fixed z-50 inset-0 flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
          >
            <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl max-w-md w-full p-6 border border-neutral-300/30 dark:border-neutral-700/50">

              {/* Header */}
              <motion.h1
                className="text-2xl font-bold text-center text-black dark:text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Connect PullShark GitHub App
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-neutral-600 dark:text-neutral-300 mt-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                To enable automatic AI analysis for your pull requests,
                please install the PullShark GitHub App on your repository.
              </motion.p>

              {/* Button */}
              <motion.a
                href={installUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="block mt-6 bg-black dark:bg-white text-white dark:text-black
                           py-3 rounded-xl text-center font-semibold shadow-lg hover:shadow-xl
                           transition-all"
              >
                Install PullShark App
              </motion.a>

              {/* Close Button */}
              <motion.button
                onClick={() => setVisible(false)}
                whileHover={{ scale: 1.07 }}
                className="mt-4 w-full text-sm text-neutral-500 dark:text-neutral-400
                           hover:text-neutral-700 dark:hover:text-neutral-300 transition"
              >
                Not now
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
