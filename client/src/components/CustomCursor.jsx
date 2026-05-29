import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOrTouch, setIsMobileOrTouch] = useState(true);

  // Motion values for smooth coordinate springs
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Springs configuration for organic lagging effect
  const springConfig = { damping: 28, stiffness: 220, mass: 0.6 };
  const trailX = useSpring(cursorX, springConfig);
  const trailY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Detect touch device or mobile user agent
    const checkDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileQuery = window.matchMedia('(pointer: coarse)').matches;
      setIsMobileOrTouch(hasTouch || isMobileQuery);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (isMobileOrTouch) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      const target = e.target;
      if (!target) return;

      // Detect button, links, inputs, and elements matching select or clickable items
      const isOverInteractive = target.closest(
        'a, button, input[type="submit"], input[type="button"], select, [role="button"], [data-cursor="blood-drop"]'
      );

      if (isOverInteractive) {
        setIsHovering(true);
        document.body.classList.add('custom-cursor-none');
      } else {
        setIsHovering(false);
        document.body.classList.remove('custom-cursor-none');
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
      setIsHovering(false);
      document.body.classList.remove('custom-cursor-none');
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.body.classList.remove('custom-cursor-none');
    };
  }, [isMobileOrTouch, cursorX, cursorY]);

  if (isMobileOrTouch || !isVisible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: trailX,
        y: trailY,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          scale: isHovering ? 1.6 : 0,
          opacity: isHovering ? 0.75 : 0,
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: -24,
          top: -24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          background: 'rgba(239, 68, 68, 0.08)',
          boxShadow: '0 0 20px var(--accent-glow)',
        }}
      />

      {/* Inner Blood-Drop pointer */}
      <motion.div
        animate={{
          scale: isHovering ? 1.15 : 0,
          opacity: isHovering ? 1 : 0,
          rotate: isHovering ? [0, 8, -8, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.18 },
          rotate: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          left: -10,
          top: -12,
          transformOrigin: '50% 50%',
        }}
      >
        <svg viewBox="0 0 100 120" width="20" height="24">
          <defs>
            <linearGradient id="bloodCursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d="M50 0 C50 0 100 60 100 85 A50 50 0 0 1 0 85 C0 60 50 0 50 0 Z"
            fill="url(#bloodCursorGrad)"
            filter="drop-shadow(0 0 5px rgba(239, 68, 68, 0.6))"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
