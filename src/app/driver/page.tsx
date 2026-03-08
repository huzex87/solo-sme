'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DriverService, DriverOrder } from '@/services/driverService';
import { MapPin, Package, Navigation, BellRing, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './driver.module.css';

export default function DriverDashboard() {
    const [tasks, setTasks] = useState<DriverOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadInitialTasks = async () => {
            const data = await DriverService.getAvailableTasks();
            if (isMounted) {
                setTasks(data);
                setLoading(false);
            }
        };

        loadInitialTasks();

        const channel = supabase
            .channel('driver-task-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `delivery_method=eq.delivery`
            }, (payload) => {
                console.log('[Driver] Task update received:', payload);
                if (isMounted) {
                    loadInitialTasks();
                }
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    const handleClaim = async (id: string) => {
        const ok = await DriverService.claimTask(id);
        if (ok) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    return (
        <div className="animate-entrance" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>Dispatch Radar</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time local delivery requests</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-success)', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 800 }}>
                    <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    ONLINE
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--accent-primary)' }}>
                    <Loader2 size={40} className="animate-spin" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 700 }}>Scanning for tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--glass-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-2xl)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-tertiary)' }}>
                        <BellRing size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Active Tasks</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                        Stay online. You will hear a ping as soon as a merchant dispatches a new order.
                    </p>
                </div>
            ) : (
                <div className={styles.taskList} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {tasks.map(task => (
                        <div key={task.id} className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                        Order #{task.id.slice(0, 8)}
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{task.customer_name}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Base Payout</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-success)' }}>₦{task.delivery_fee.toLocaleString()}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', background: 'var(--border-subtle)', zIndex: 0 }} />

                                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Package size={12} color="var(--accent-primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Pickup From</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{task.pickup_address || "Merchant Store HQ"}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 4px var(--bg-card)' }}>
                                        <MapPin size={12} color="#fff" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Deliver To</div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{task.delivery_address}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>
                                    <Navigation size={14} />
                                    Est. 15 mins
                                </div>
                                <button className="btn btn-primary" onClick={() => handleClaim(task.id)}>
                                    <CheckCircle2 size={16} className="mr-2" />
                                    Accept Delivery
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
