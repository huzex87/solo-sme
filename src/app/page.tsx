import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.nebulaGlow}></div>

        <header className={styles.header}>
          <div className="glass" style={{ padding: '0.5rem 1.5rem' }}>
            <span className="glow-text" style={{ fontWeight: 700, letterSpacing: '2px' }}>SOLO</span>
          </div>
        </header>

        <section className={styles.content}>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 800 }}>
            The Business Brain.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '1.5rem auto' }}>
            Scale your SME with predictive intelligence, omnichannel automation, and a world-class digital storefront that builds itself in seconds.
          </p>

          <div className={styles.actions}>
            <button className="glass" style={{ padding: '1rem 2rem', fontWeight: 600, fontSize: '1rem', transition: 'var(--transition-smooth)' }}>
              Get Started
            </button>
            <button style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Watch Demo
            </button>
          </div>
        </section>

        <div className={styles.featureGrid}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 className="accent-text" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>AI Onboarding</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Drop a link, we build the brand. Automated storefront creation from social media.</p>
          </div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 className="accent-text" style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>Omnichannel Hub</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unified inbox for WhatsApp, Instagram, and Web sales with AI sales support.</p>
          </div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 className="accent-text" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Growth Engine</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Predictive inventory and automated CRM to keep your customers coming back.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
