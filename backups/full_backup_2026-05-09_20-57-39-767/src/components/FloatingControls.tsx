import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingControls() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Need to find the scrollable container. Since it's in App.tsx (main > div), we can track its scroll.
    const container = document.getElementById('scrollable-main');
    if (!container) return;

    const toggleVisibility = () => {
      if (container.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener('scroll', toggleVisibility);

    return () => container.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById('scrollable-main');
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <button
            onClick={scrollToTop}
            className="p-3 bg-[#003865] text-white rounded-full shadow-lg hover:bg-[#002b4d] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003865]"
            title="Voltar ao início"
            aria-label="Voltar ao início"
          >
            <ArrowUp size={24} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
