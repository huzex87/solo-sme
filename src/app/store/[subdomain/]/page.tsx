import styles from './store.module.css';

export default function StorePage() {
    return (
        <div className={styles.page}>
            <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Welcome to our Boutique.
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                    Experience the latest in curated selection and premium quality.
                </p>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass" style={{ padding: '1.5rem', transition: 'var(--transition-smooth)' }}>
                        <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}></div>
                        <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Premium Product {i}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Elegant description of this world-class item.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>$199.00</span>
                            <button className="glass" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: 600 }}>Add to Bag</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
