"use client";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
    date: string;
    revenue: number;
    [key: string]: string | number;
}

interface AnalyticsChartProps {
    data: ChartDataPoint[];
    type?: 'area' | 'bar';
    height?: number;
}

export function AnalyticsChart({ data, type = 'area', height = 300 }: AnalyticsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200" style={{ height }}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Transaction Data...</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {label ? new Date(label).toLocaleDateString() : '---'}
                    </p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                {type === 'area' ? (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            tickFormatter={(str) => {
                                if (!str) return '';
                                const date = new Date(str);
                                return date.toLocaleDateString(undefined, { weekday: 'short' });
                            }}
                            minTickGap={30}
                        />
                        <YAxis
                            hide
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                ) : (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            tickFormatter={(str) => {
                                if (!str) return '';
                                const date = new Date(str);
                                return date.toLocaleDateString(undefined, { weekday: 'short' });
                            }}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="revenue"
                            fill="var(--primary)"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            animationDuration={1500}
                        />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
