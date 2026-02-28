'use client';

import { useState, useEffect } from 'react';
import styles from '../store.module.css';
import { LogisticsService, Location } from '@/services/logisticsService';

export default function StoreLocatorPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    useEffect(() => {
        LogisticsService.getStoreLocations('t1').then(setLocations);
    }, []);

    return (
        <div className={styles.productDetailContainer}>
            <div className={styles.header} style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className={styles.sectionTitle} style={{ fontSize: 'var(--font-size-3xl)' }}>Store Locator</h1>
                <p style={{ color: 'var(--text-tertiary)' }}>Find a SOLO location near you for easy pickup.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className={styles.locationList}>
                    {locations.map((loc, idx) => (
                        <div
                            key={idx}
                            className={`card ${styles.locationCard} ${selectedLocation?.address === loc.address ? styles.activeLocation : ''}`}
                            onClick={() => setSelectedLocation(loc)}
                            style={{ padding: '1.5rem', cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.2s ease' }}
                        >
                            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{loc.address.split(',')[0]}</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{loc.address}</p>
                            <div style={{ marginTop: '1rem', fontSize: '10px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                OPEN UNTIL 9:00 PM
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`card ${styles.mapPlaceholder}`} style={{ height: '500px' }}>
                    {selectedLocation ? (
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '3rem' }}>📍</span>
                            <h3 style={{ marginTop: '1rem' }}>{selectedLocation.address}</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.mapLabel}>Select a location to view on map</div>
                    )}
                </div>
            </div>
        </div>
    );
}
