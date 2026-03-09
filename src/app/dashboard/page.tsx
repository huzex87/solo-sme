'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  PlusCircle, Sparkles, AlertCircle, Box,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Loader2, Zap, Palette, Package, Activity
} from 'lucide-react';
import styles from './page.module.css';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { OrderService, Order } from '@/services/orderService';
import { useTenant } from '@/context/TenantContext';
import PulseFeed from '@/components/dashboard/PulseFeed';
import CelebrationSystem from '@/components/shared/CelebrationSystem';
import { ProductService } from '@/services/productService';
import { formatCurrency } from '@/lib/formatCurrency';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const STATUS_MAP: Record<string, string> = {
  pending:   'badge-warning',
  paid:      'badge-teal',
  shipped:   'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-ghost',
  processing:'badge-amber',
};

export default function DashboardPage() {
  const { tenantId, tenantName } = useTenant();
  const [stats, setStats]               = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [celebrate, setCelebrate]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!tenantId) return;
      try {
        setLoading(true);
        const [analyticsData, ordersData] = await Promise.all([
          AnalyticsService.getDashboardStats(tenantId),
          OrderService.getOrders(tenantId),
        ]);
        setStats(analyticsData);
        setRecentOrders(ordersData.slice(0, 6));
        if (analyticsData.totalRevenue >= 500000) setCelebrate(true);
      } catch {
        setError('Could not load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId]);

  if (loading) return (
    <div className={styles.loadingState}>
      <Loader2 className="animate-spin" size={36} style={{ color: 'var(--primary)' }} />
      <p>Loading your dashboard…</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorState}>
      <AlertCircle size={40} />
      <h3>Something went wrong</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
    </div>
  );

  const STAT_CARDS = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      delta: stats?.comparison.revenueDelta ?? 0,
      icon: DollarSign,
      iconBg: 'icon-bg-green',
      accentColor: 'var(--accent-revenue)',
    },
    {
      label: 'Total Orders',
      value: (stats?.orderCount ?? 0).toLocaleString(),
      delta: stats?.comparison.ordersDelta ?? 0,
      icon: ShoppingCart,
      iconBg: 'icon-bg-blue',
      accentColor: 'var(--accent-orders)',
    },
    {
      label: 'Avg. Order Value',
      value: formatCurrency(stats?.averageOrderValue ?? 0),
      delta: stats?.comparison.aovDelta ?? 0,
      icon: Activity,
      iconBg: 'icon-bg-amber',
      accentColor: 'var(--accent-customers)',
    },
    {
      label: '7-Day Visitors',
      value: (stats?.activeUsers7d ?? 0).toLocaleString(),
      delta: stats?.comparison.visitorsDelta ?? 0,
      icon: Users,
      iconBg: 'icon-bg-teal',
      accentColor: 'var(--primary)',
    },
  ];

  return (
    <div className="animate-entrance">
      <CelebrationSystem trigger={celebrate} onComplete={() => setCelebrate(false)} />

      {/* ── HEADER ── */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.greeting}>{getGreeting()}</div>
          <h1 className={styles.pageTitle}>{tenantName || 'My Business'}</h1>
          <p className={styles.pageSubtitle}>Here's what's happening with your store today.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">
            View All Orders
          </Link>
          <Link href="/dashboard/pos" className="btn btn-accent btn-sm">
            <Zap size={14} />
            Open POS
          </Link>
        </div>
      </div>

      {/* ── PULSE FEED ── */}
      <PulseFeed tenantId={tenantId} />

      {/* ── STAT CARDS ── */}
      <div className={styles.statsRow}>
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={styles.statCard} style={{ '--accent-color': s.accentColor } as React.CSSProperties}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{s.label}</span>
              <div className={`${styles.statIcon} ${s.iconBg} icon-bg`}>
                <s.icon size={16} strokeWidth={2} />
              </div>
            </div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statFooter}>
              {s.delta !== 0 ? (
                <span className={`${styles.statTrend} ${s.delta >= 0 ? styles.trendUp : styles.trendDown}`}>
                  {s.delta >= 0
                    ? <ArrowUpRight size={11} />
                    : <ArrowDownRight size={11} />
                  }
                  {Math.abs(s.delta).toFixed(1)}%
                </span>
              ) : (
                <span className={`${styles.statTrend} ${styles.trendNeutral}`}>—</span>
              )}
              <span className={styles.statHint}>vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className={styles.actionsRow}>
        <Link href="/dashboard/products/new" className={styles.actionBtn}>
          <div className={`${styles.actionIconWrap} ${styles.actionIconGreen}`}><PlusCircle size={18} /></div>
          <div className={styles.actionText}>
            <h4>Add Product</h4>
            <p>List a new item to sell</p>
          </div>
        </Link>
        <Link href="/dashboard/hub" className={styles.actionBtn}>
          <div className={`${styles.actionIconWrap} ${styles.actionIconPurple}`}><Sparkles size={18} /></div>
          <div className={styles.actionText}>
            <h4>Messages</h4>
            <p>View customer conversations</p>
          </div>
        </Link>
        <Link href="/dashboard/settings" className={styles.actionBtn}>
          <div className={`${styles.actionIconWrap} ${styles.actionIconAmber}`}><Palette size={18} /></div>
          <div className={styles.actionText}>
            <h4>Store Settings</h4>
            <p>Branding, payments & more</p>
          </div>
        </Link>
      </div>

      {/* ── MAIN TWO-COLUMN GRID ── */}
      <div className={styles.mainGrid}>
        {/* Recent Orders */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Recent Orders</span>
            <Link href="/dashboard/orders" className={styles.sectionLink}>View All →</Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className={styles.orderCust}>{order.customer_name}</td>
                    <td className={styles.orderAmt}>{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`badge ${STATUS_MAP[order.status] || 'badge-ghost'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <button className={styles.rowMenu}><MoreHorizontal size={15} /></button>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '13px' }}>
                      No orders yet. Share your store link to start selling!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Stock Alerts</span>
            <Link href="/dashboard/products" className={styles.sectionLink}>Manage →</Link>
          </div>
          <div className={styles.alertsList}>
            {stats?.stockAlerts.slice(0, 5).map((alert, i) => (
              <div key={i} className={`${styles.alertItem} ${alert.severity === 'critical' ? styles.critical : styles.warning}`}>
                <div className={styles.alertIcon}>
                  {alert.severity === 'critical' ? <AlertCircle size={15} /> : <Box size={15} />}
                </div>
                <div className={styles.alertContent}>
                  <h4>{alert.productName}</h4>
                  <p>
                    {alert.predictedExhaustionDays === 0
                      ? 'Out of stock'
                      : `~${alert.predictedExhaustionDays} days left`
                    }
                  </p>
                </div>
                <button className={styles.restockBtn}>Restock</button>
              </div>
            ))}
            {(!stats?.stockAlerts || stats.stockAlerts.length === 0) && (
              <div className={styles.emptyAlerts}>
                <Box size={28} strokeWidth={1.5} />
                <p>All products are well-stocked.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
