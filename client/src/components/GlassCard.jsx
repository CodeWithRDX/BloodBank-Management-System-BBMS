import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const GlassCard = forwardRef(
  (
    {
      glow = false,
      hover = true,
      className = '',
      style,
      children,
      onClick,
      as: Tag,
      ...rest
    },
    ref
  ) => {
    const baseClass = glow ? 'glass-card-glow' : 'glass-card';
    const combinedClassName = `${baseClass} ${className}`.trim();

    // Use motion() to create a motion-wrapped custom tag, or default to motion.div
    const MotionComponent = Tag ? motion.create(Tag) : motion.div;

    const hoverAnimation = hover
      ? { scale: 1.01, y: -2 }
      : undefined;

    const transitionConfig = {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    };

    return (
      <MotionComponent
        ref={ref}
        className={combinedClassName}
        style={style}
        onClick={onClick}
        whileHover={hoverAnimation}
        transition={transitionConfig}
        {...rest}
      >
        {children}
      </MotionComponent>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
