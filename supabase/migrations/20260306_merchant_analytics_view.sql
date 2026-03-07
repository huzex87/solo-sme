-- =============================================================================
-- Phase 12: Backend Analytics Optimization
-- High-performance view for pre-aggregated merchant statistics
-- =============================================================================
CREATE OR REPLACE VIEW public.merchant_analytics AS WITH order_stats AS (
        SELECT tenant_id,
            COUNT(id) AS total_orders,
            COALESCE(SUM(total_amount), 0) AS total_revenue,
            COUNT(DISTINCT customer_email) AS total_unique_customers,
            -- Current 7 Days
            COUNT(id) FILTER (
                WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')
            ) AS orders_7d,
            COALESCE(
                SUM(total_amount) FILTER (
                    WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')
                ),
                0
            ) AS revenue_7d,
            -- Previous 7 Days (14d to 7d)
            COUNT(id) FILTER (
                WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '14 days')
                    AND created_at < (CURRENT_TIMESTAMP - INTERVAL '7 days')
            ) AS orders_prev_7d,
            COALESCE(
                SUM(total_amount) FILTER (
                    WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '14 days')
                        AND created_at < (CURRENT_TIMESTAMP - INTERVAL '7 days')
                ),
                0
            ) AS revenue_prev_7d
        FROM public.orders
        GROUP BY tenant_id
    )
SELECT tenant_id,
    total_revenue,
    total_orders,
    total_unique_customers,
    revenue_7d,
    orders_7d,
    revenue_prev_7d,
    orders_prev_7d,
    CASE
        WHEN orders_7d > 0 THEN revenue_7d / orders_7d
        ELSE 0
    END AS aov_7d,
    CASE
        WHEN orders_prev_7d > 0 THEN revenue_prev_7d / orders_prev_7d
        ELSE 0
    END AS aov_prev_7d
FROM order_stats;
-- Ensure the view is accessible but filtered by RLS on the underlying 'orders' table
-- Note: Views in Postgres 15+ can have security_invoker = true
ALTER VIEW public.merchant_analytics
SET (security_invoker = true);
COMMENT ON VIEW public.merchant_analytics IS 'Pre-aggregated analytics for SOLO SME merchants. Respects tenant isolation via security invoker.';