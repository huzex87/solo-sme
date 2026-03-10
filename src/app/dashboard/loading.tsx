export default function DashboardLoading() {
    return (
        <div className="animate-entrance" style={{
            display: 'flex', flexDirection: 'column', gap: 20,
            padding: 'clamp(12px, 3vw, 32px)',
        }}>
            {/* Header skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="skeleton" style={{ width: 180, height: 22, borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 240, height: 14, borderRadius: 4 }} />
                </div>
            </div>

            {/* Stat cards skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
                gap: 12,
            }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{
                        background: 'var(--card)', border: '1px solid var(--border)',
                        borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                        <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: 120, height: 10, borderRadius: 4 }} />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            }}>
                <div style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 20, minHeight: 200,
                }}>
                    <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 4, marginBottom: 16 }} />
                    <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 8 }} />
                </div>
                <div style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 20, minHeight: 200,
                }}>
                    <div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 4, marginBottom: 16 }} />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{
                            width: '100%', height: 32, borderRadius: 6, marginBottom: 8,
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
