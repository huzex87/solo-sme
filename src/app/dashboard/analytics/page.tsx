'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Users, Activity, AlertTriangle, Clock, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { FinanceService } from '@/services/financeService';
import { AIAnalyticsService, AIInsight } from '@/services/aiAnalyticsService';
import { InsightsService, SalesForecast, CustomerSegment, BusinessHealthScore } from '@/services/insightsService';
import { useTenant } from '@/context/TenantContext';
import styles from './analytics.module.css';
import SalesChart from '@/components/dashboard/SalesChart';
import EmptyState from '@/components/shared/EmptyState';
import PassportTemplate from '@/components/dashboard/reports/PassportTemplate';
import { ReportService } from '@/services/reportService';
import { formatCurrency } from '@/lib/formatCurrency';

export default function AnalyticsPage() {
    const { tenantId } = useTenant();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [forecasts, setForecasts] = useState<SalesForecast[]>([]);
    const [segments, setSegments] = useState<CustomerSegment[]>([]);
    const [health, setHealth] = useState<BusinessHealthScore | null>(null);
    const [ltv, setLtv] = useState<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [passportData, setPassportData] = useState<any>(null);
    const [isGeneratingPassport, setIsGeneratingPassport] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            if (!tenantId) return;
            try {
                setLoading(true);
                setError(null);
                const data = await AnalyticsService.getDashboardStats(tenantId);
                setStats(data);

                // Phase 4: Extended Insights
                const [forecastData, segmentData, healthData, ltvValue] = await Promise.all([
                    InsightsService.getSalesForecast(tenantId),
                    InsightsService.getCustomerSegments(tenantId),
                    InsightsService.getBusinessHealth(tenantId),
                    InsightsService.getAverageLTV(tenantId)
                ]);
                setForecasts(forecastData);
                setSegments(segmentData);
                setHealth(healthData);
                setLtv(ltvValue);

                // Fetch AI Insights once core stats are in
                setAnalyzing(true);
                const finance = await FinanceService.getFinancialSummary(tenantId);
                const aiTips = await AIAnalyticsService.getBusinessInsights(data, finance);
                setInsights(aiTips);
            } catch (error: unknown) {
                const err = error as Error;
                console.error('[Analytics] Fetch failed:', err);
                setError(err.message || 'Failed to load business intelligence data');
            } finally {
                setLoading(false);
                setAnalyzing(false);
            }
        }
        fetchStats();
    }, [tenantId]);

    const refreshInsights = async () => {
        if (!tenantId || !stats) return;
        setAnalyzing(true);
        try {
            const finance = await FinanceService.getFinancialSummary(tenantId);
            const aiTips = await AIAnalyticsService.getBusinessInsights(stats, finance);
            setInsights(aiTips);
        } finally {
            setAnalyzing(false);
        }
    };

    const generatePassport = async () => {
        if (!tenantId) return;
        setIsGeneratingPassport(true);
        try {
            const data = await ReportService.generateCreditReadinessPassport(tenantId);
            setPassportData(data);
            // Short delay for React to render the template before printing
            setTimeout(() => window.print(), 500);
        } catch (err) {
            console.error('Passport generation failed:', err);
        } finally {
            setIsGeneratingPassport(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                <p className="text-muted text-sm font-medium">Analyzing business data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <AlertTriangle className="error-icon" size={48} />
                <h2>Insights Not Loaded</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Retry Connection
                </button>
            </div>
        );
    }

    if (!stats || stats.totalRevenue === 0) {
        return (
            <EmptyState
                icon={Activity}
                title="Waiting for Orders"
                description="Your analytics will illuminate here once your first orders begin to flow. Add products or launch a campaign to get started."
                action={
                    <div className="flex gap-3">
                        <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard/products'}>
                            Add Products
                        </button>
                        <button className="btn btn-secondary" onClick={() => window.location.href = '/dashboard/marketing'}>
                            Launch Campaign
                        </button>
                    </div>
                }
            />
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Analytics</h1>
                    <p className={styles.subtitle}>Intelligent insights for your business growth.</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className="btn btn-primary"
                        onClick={generatePassport}
                        disabled={isGeneratingPassport}
                    >
                        {isGeneratingPassport ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Export Credit Passport
                    </button>
                    <div className={styles.timeRange}>
                        <span>Last 7 Days</span>
                    </div>
                </div>
            </div>

            <div className={styles.metricsGrid}>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Total Revenue</span>
                    <h2 className={`${styles.metricValue} font-mono`}>{formatCurrency(stats.totalRevenue)}</h2>
                    <div className={stats.comparison.revenueDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.revenueDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.revenueDelta).toFixed(1)}% {stats.comparison.revenueDelta >= 0 ? 'growth' : 'decrease'}
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Avg order value</span>
                    <h2 className={`${styles.metricValue} font-mono`}>{formatCurrency(stats.averageOrderValue)}</h2>
                    <div className={stats.comparison.aovDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.aovDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.aovDelta).toFixed(1)}% variance
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>7D Reach</span>
                    <h2 className={`${styles.metricValue} font-mono`}>{stats.activeUsers7d}</h2>
                    <div className={stats.comparison.visitorsDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.visitorsDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.visitorsDelta).toFixed(1)}% interaction
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Conversion</span>
                    <h2 className={`${styles.metricValue} font-mono`}>{stats.conversionRate.toFixed(1)}%</h2>
                    <div className={stats.comparison.ordersDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.ordersDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.ordersDelta).toFixed(1)}% efficacy
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Average LTV</span>
                    <h2 className={`${styles.metricValue} font-mono`}>{formatCurrency(ltv)}</h2>
                    <div className={styles.trendUp}>
                        <Users size={12} />
                        CLV Projection
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className={styles.aiInsightsSection}>
                <div className={styles.aiHeader}>
                    <Sparkles size={24} color="var(--accent-primary)" />
                    <h3 className={styles.aiTitle}>SOLO AI Growth Consultant</h3>
                    {analyzing && <Loader2 size={16} className="animate-spin" style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                    {!analyzing && insights.length > 0 && <button onClick={refreshInsights} className={styles.timeRange} style={{ marginLeft: 'auto' }}>Recalculate Insights</button>}
                </div>

                {analyzing && insights.length === 0 ? (
                    <div className={styles.aiLoading}>
                        <Lightbulb size={32} color="var(--accent-primary)" className="animate-pulse" />
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Gemini is analyzing your business metrics...</p>
                    </div>
                ) : (
                    <div className={styles.aiGrid}>
                        {insights.map((insight, idx) => (
                            <div key={idx} className={`${styles.aiCard} ${analyzing ? styles.shimmer : ''}`}>
                                <span className={`${styles.aiImpact} ${styles[insight.impact]}`}>{insight.impact} Impact</span>
                                <h4>{insight.title}</h4>
                                <p>{insight.description}</p>
                                <button className={styles.aiActionBtn} onClick={() => window.location.href = insight.actionUrl}>
                                    {insight.actionLabel} <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Phase 4: Forecasting & Health Score */}
            <div className={styles.insightsRow}>
                <div className={`card ${styles.forecastCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>AI Sales Forecast</h3>
                        <p>Projected revenue patterns for the coming month</p>
                    </div>
                    <div className={styles.forecastGrid}>
                        {forecasts.map((f, i) => (
                            <div key={i} className={styles.forecastItem}>
                                <span className={styles.forecastPeriod}>{f.period}</span>
                                <h4 className={`${styles.forecastValue} font-mono`}>{formatCurrency(f.predictedRevenue)}</h4>
                                <div className={styles.confidenceBar}>
                                    <div className={styles.confidenceFill} style={{ width: `${f.confidence * 100}%` }} />
                                </div>
                                <span className={styles.confidenceLabel}>{(f.confidence * 100).toFixed(0)}% Confidence Score</span>
                            </div>
                        ))}
                    </div>
                </div>

                {health && (
                    <div className={`card ${styles.healthCard}`}>
                        <div className={styles.cardHeader}>
                            <h3>Business Health Score</h3>
                            <p>Overall operational efficiency rating</p>
                        </div>
                        <div className={styles.healthContent}>
                            <div className={styles.scoreContainer}>
                                <div className={`${styles.scoreCircle} ${styles[health.status]}`}>
                                    <span>{health.score}</span>
                                </div>
                                <span className={`${styles.statusBadge} ${styles[health.status]}`}>{health.status.toUpperCase()}</span>
                            </div>
                            <div className={styles.recommendations}>
                                {health.recommendations.map((r, i) => (
                                    <div key={i} className={styles.recommendationItem}>
                                        <Lightbulb size={14} className="text-accent" />
                                        <p>{r}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Phase 4: Customer Segmentation */}
            <div className={`card ${styles.segmentsCard}`}>
                <div className={styles.cardHeader}>
                    <h3>Customer Strategic Segments</h3>
                    <p>Understanding your customer lifecycle distribution</p>
                </div>
                <div className={styles.segmentsGrid}>
                    {segments.map((s) => (
                        <div key={s.id} className={styles.segmentCard}>
                            <div className={styles.segmentIcon} style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                                <Users size={20} />
                            </div>
                            <div className={styles.segmentInfo}>
                                <h4>{s.label}</h4>
                                <p>{s.description}</p>
                            </div>
                            <div className={styles.segmentCount}>
                                <span>{s.count}</span>
                                <label>Customers</label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.chartsGrid} style={{ marginTop: 'var(--space-3xl)' }}>
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Sales Trends</h3>
                        <p>Revenue velocity over the last 7 days</p>
                    </div>
                    <SalesChart data={stats.salesTrends} />
                </div>

                <div className={`card ${styles.topProductsCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Best Sellers</h3>
                        <p>Your highest revenue contributors</p>
                    </div>
                    <div className={styles.productList}>
                        {stats.topProducts.map((p, idx) => (
                            <div key={idx} className={styles.productRow}>
                                <div className={styles.productInfo}>
                                    <span className={styles.rank}>{idx + 1}</span>
                                    <span className={styles.pName}>{p.name}</span>
                                </div>
                                <div className={styles.productStats}>
                                    <span className={`${styles.pSales} font-mono`}>{p.sales} units</span>
                                    <span className={`${styles.pRevenue} font-mono`}>{formatCurrency(p.revenue)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`card ${styles.predictiveCard}`}>
                <div className={styles.cardHeader}>
                    <h3>Inventory Intelligence</h3>
                    <p>Stock run-rate analysis and exhaustion predictions</p>
                </div>

                {stats.stockAlerts.length === 0 ? (
                    <p className={styles.textMuted}>All inventory levels optimized. No critical alerts.</p>
                ) : (
                    <div className={styles.alertList}>
                        {stats.stockAlerts.map((alert, idx) => (
                            <div key={idx} className={`${styles.alertItem} ${styles[alert.severity]}`}>
                                <div className={styles.alertIcon}>
                                    {alert.severity === 'critical' ? <AlertTriangle color="var(--color-error)" /> : <Clock color="var(--color-warning)" />}
                                </div>
                                <div className={styles.alertContent}>
                                    <h4>{alert.productName}</h4>
                                    <p>
                                        Currently <strong>{alert.currentStock} in stock</strong>.
                                        {alert.predictedExhaustionDays === 0
                                            ? ' Exhausted or critically low.'
                                            : ` Predicted sell-out in ${alert.predictedExhaustionDays} days.`}
                                    </p>
                                    <button className={styles.restockBtn} onClick={() => window.location.href = '/dashboard/inventory'}>
                                        Restock Item
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div id="passport-print-mount" className={styles.printOnly}>
                <PassportTemplate data={passportData} businessName="Your SOLO Store" />
            </div>
        </div>
    );
}
