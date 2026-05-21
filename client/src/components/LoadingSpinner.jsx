const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const dim = { sm: '1.5rem', md: '2.5rem', lg: '3.5rem' }[size] || '2.5rem';
  const border = { sm: '3px', md: '3px', lg: '4px' }[size] || '3px';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      gap: '1rem',
    }}>
      {/* Outer ring */}
      <div style={{ position: 'relative', width: dim, height: dim }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${border} solid var(--accent-soft)`,
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.75s linear infinite',
        }} />
        {/* Inner pulse */}
        <div style={{
          position: 'absolute',
          inset: '25%',
          borderRadius: '50%',
          background: 'var(--accent-soft)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
      {text && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          fontWeight: 500,
          letterSpacing: '0.03em',
        }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:0.8; transform:scale(1.1); } }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
