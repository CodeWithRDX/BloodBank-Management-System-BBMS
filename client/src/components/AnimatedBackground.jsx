import { useEffect, useState } from 'react';

const AnimatedBackground = ({ variant = 'default' }) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (reducedMotion) return null;

  // Different orb configurations per variant
  const configs = {
    default: [
      { className: 'orb orb-1', style: { width: 500, height: 500, top: '-10%', left: '-5%', animationDuration: '15s' } },
      { className: 'orb orb-2', style: { width: 400, height: 400, bottom: '-10%', right: '-5%', animationDuration: '18s', animationDirection: 'reverse' } },
      { className: 'orb orb-3', style: { width: 300, height: 300, top: '40%', left: '50%', animationDuration: '20s', animationDelay: '3s' } },
    ],
    hero: [
      { className: 'orb orb-1', style: { width: 600, height: 600, top: '-15%', left: '10%', animationDuration: '12s' } },
      { className: 'orb orb-2', style: { width: 500, height: 500, bottom: '-15%', right: '10%', animationDuration: '16s', animationDirection: 'reverse' } },
      { className: 'orb orb-3', style: { width: 400, height: 400, top: '30%', right: '20%', animationDuration: '18s', animationDelay: '2s' } },
      { className: 'orb', style: { width: 350, height: 350, bottom: '20%', left: '30%', background: 'radial-gradient(circle, var(--gradient-orb-2), transparent 70%)', filter: 'blur(80px)', animationDuration: '22s', animationDelay: '5s' } },
    ],
    dashboard: [
      { className: 'orb orb-1', style: { width: 400, height: 400, top: '-15%', right: '-10%', animationDuration: '20s', opacity: 0.4 } },
      { className: 'orb orb-2', style: { width: 300, height: 300, bottom: '-10%', left: '-5%', animationDuration: '25s', animationDirection: 'reverse', opacity: 0.3 } },
    ],
    minimal: [
      { className: 'orb orb-1', style: { width: 300, height: 300, top: '-10%', right: '-5%', animationDuration: '25s', opacity: 0.3 } },
    ],
  };

  const orbs = configs[variant] || configs.default;

  return (
    <div className="animated-bg" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={orb.className}
          style={{
            ...orb.style,
            animation: `orb-drift ${orb.style.animationDuration || '15s'} ease-in-out infinite ${orb.style.animationDelay || '0s'}`,
            animationDirection: orb.style.animationDirection || 'normal',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
