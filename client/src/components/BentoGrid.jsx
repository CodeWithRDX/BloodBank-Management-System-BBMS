import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

/**
 * BentoGrid — responsive grid layout container.
 *
 * @param {2|3|4}   columns   - Number of columns on large screens (default 3)
 * @param {string}  gap       - CSS gap value (default '1.5rem')
 * @param {string}  className - Additional CSS classes
 * @param {React.ReactNode} children
 */
export const BentoGrid = ({
  columns = 3,
  gap = '1.5rem',
  className = '',
  children,
}) => {
  // Build responsive grid-template-columns:
  //   mobile  → 1 column
  //   tablet  → 2 columns
  //   desktop → `columns` columns
  // We use CSS class + inline override for the desktop track count.
  return (
    <div
      className={`bento-grid ${className}`.trim()}
      style={{
        '--bento-cols': columns,
        '--bento-gap': gap,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Span class mapping for grid items.
 */
const spanClassMap = {
  normal: 'bento-item',
  wide: 'bento-item bento-item--wide',    // col-span-2
  tall: 'bento-item bento-item--tall',     // row-span-2
  large: 'bento-item bento-item--large',   // col-span-2 + row-span-2
};

/**
 * BentoItem — individual grid cell with staggered scroll-reveal entrance.
 *
 * @param {'normal'|'wide'|'tall'|'large'} span - Grid span preset
 * @param {string}  className - Additional CSS classes
 * @param {number}  delay     - Entrance animation delay (seconds)
 * @param {React.ReactNode} children
 */
export const BentoItem = ({
  span = 'normal',
  className = '',
  delay = 0,
  children,
  ...rest
}) => {
  const spanClass = spanClassMap[span] || spanClassMap.normal;

  return (
    <ScrollReveal direction="up" delay={delay} duration={0.5}>
      <motion.div className={`${spanClass} ${className}`.trim()} {...rest}>
        {children}
      </motion.div>
    </ScrollReveal>
  );
};

export default BentoGrid;
