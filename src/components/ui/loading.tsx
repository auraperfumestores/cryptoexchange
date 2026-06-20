interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = { sm: 20, md: 32, lg: 48 };

export function Loading({ size = 'md', label, className }: LoadingProps) {
  const s = sizeMap[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }} className={className}>
      <div style={{
        width: s, height: s,
        border: `${size === 'sm' ? 2 : 2.5}px solid rgba(204,255,0,0.15)`,
        borderTopColor: '#CCFF00',
        borderRadius: '50%',
        animation: 'fr-spin 0.75s linear infinite',
        flexShrink: 0,
      }} />
      {label && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{label}</p>}
      <style>{`@keyframes fr-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function PageLoading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loading size="lg" label="Loading…" />
    </div>
  );
}

export function InlineLoading() {
  return <Loading size="sm" />;
}
