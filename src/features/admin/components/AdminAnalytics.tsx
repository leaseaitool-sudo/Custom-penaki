import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabaseClient';
import { Lease, LeaseStatus, Role } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { PresentationChartLineIcon } from '@/shared/ui/Icons/PresentationChartLineIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { ExclamationTriangleIcon } from '@/shared/ui/Icons/ExclamationTriangleIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { UsersIcon } from '@/shared/ui/Icons/UsersIcon';
import { ChartBarIcon } from '@/shared/ui/Icons/ChartBarIcon';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';

interface AdminAnalyticsProps {
    leases: Lease[];
    onBack: () => void;
}

// Helper: Format seconds to readable string
const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m > 60) {
        const h = Math.floor(m / 60);
        const remM = m % 60;
        return `${h}h ${remM}m`;
    }
    return `${m}m ${s}s`;
};

const formatLatency = (ms: number) => {
    if (!ms) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

// SVG Line Chart Component
const TrendChart = ({ data, color = "#0ea5e9" }: { data: { date: string; value: number }[], color?: string }) => {
    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <DocumentTextIcon className="w-8 h-8 mb-2 opacity-50" />
                <span>No trend data available.</span>
            </div>
        );
    }

    const chartData = data.length === 1 ? [{ ...data[0], date: 'Start' }, data[0]] : data;
    const width = 100;
    const height = 50;
    const padding = 5;
    const values = chartData.map(d => d.value);
    const maxY = Math.max(...values, 10);
    const minY = 0;

    const points = chartData.map((d, i) => {
        const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((d.value - minY) / (maxY - minY || 1)) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `${points} ${width - padding},${height} ${padding},${height}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Area Fill */}
            <polygon points={fillPath} fill={`url(#gradient-${color})`} />

            {/* The Line */}
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {chartData.map((d, i) => {
                const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
                const y = height - padding - ((d.value - minY) / (maxY - minY || 1)) * (height - 2 * padding);
                return (
                    <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke={color} strokeWidth="1" className="hover:r-2 transition-all cursor-crosshair">
                        <title>{d.date}: {d.value}</title>
                    </circle>
                );
            })}
        </svg>
    );
};

const SpeedComparisonChart = ({ humanTime, aiTime }: { humanTime: number, aiTime: number }) => {
    // humanTime is in seconds
    // aiTime is in milliseconds
    const aiTimeSec = aiTime / 1000;
    const speedMultiplier = aiTimeSec > 0 ? (humanTime / aiTimeSec).toFixed(0) : 'N/A';

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Manual Review
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">{formatDuration(humanTime)} avg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-full shadow-sm"></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> AI Extraction
                    </span>
                    <span className="text-xs font-mono text-emerald-600 font-bold">{formatLatency(aiTime)} avg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                    <div
                        className="h-full bg-emerald-500 rounded-full relative"
                        style={{ width: `${Math.max(1, (aiTimeSec / humanTime) * 100)}%` }}
                    ></div>
                </div>
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                    <p className="text-xs text-emerald-800 font-medium">
                        🚀 AI performs <strong>{speedMultiplier}x faster</strong> than human review on average.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Heatmap Visualization
const HeatmapGrid = ({ data }: { data: Record<string, Record<string, number>> }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['Morning', 'Afternoon', 'Evening'];

    return (
        <div className="grid grid-cols-8 gap-1.5">
            <div className="col-span-1"></div>
            {days.map(d => <div key={d} className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider">{d}</div>)}

            {hours.map(h => (
                <React.Fragment key={h}>
                    <div className="text-[9px] font-bold text-slate-400 text-right pr-2 self-center uppercase tracking-wider">{h.substring(0, 4)}</div>
                    {days.map(d => {
                        const val = data[d]?.[h] || 0;
                        // Calculate opacity based on max value in data set would be better, using simple scale for now
                        const opacity = val === 0 ? 0.05 : Math.min(val * 0.2 + 0.2, 1);
                        return (
                            <div
                                key={`${d}-${h}`}
                                className="aspect-square rounded bg-indigo-600 transition-all hover:scale-110 hover:shadow-sm"
                                style={{ opacity }}
                                title={`${val} uploads on ${d} ${h}`}
                            ></div>
                        )
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

const DistributionBar = ({ label, count, total, colorClass }: { label: string, count: number, total: number, colorClass: string }) => {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-600">{label}</span>
                <span className="text-slate-500">{count} ({percent}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
};

const MissingFieldsChart = ({ data }: { data: { label: string; count: number; total: number }[] }) => {
    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                No significant data drift detected.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((item, idx) => {
                const percent = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                return (
                    <div key={idx} className="relative group">
                        <div className="flex justify-between text-xs mb-1 relative z-10">
                            <span className="font-bold text-slate-600 truncate max-w-[70%]" title={item.label}>{item.label}</span>
                            <span className="text-slate-500 font-mono">{percent}% Miss Rate</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-lg h-8 overflow-hidden relative">
                            <div
                                className="h-full bg-amber-100 border-r-2 border-amber-300 transition-all duration-1000"
                                style={{ width: `${percent}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-end px-3">
                                <span className="text-[10px] font-bold text-amber-700">{item.count} misses</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ leases, onBack }) => {
    const [snapshot, setSnapshot] = useState<any>(null);

    // Fetch the high-performance PostgreSQL Enterprise Snapshot
    useEffect(() => {
        let isMounted = true;
        const fetchSnapshot = async () => {
            try {
                const { data } = await supabase
                    .from('system_metrics_snapshots')
                    .select('*')
                    .order('date', { ascending: false })
                    .limit(1)
                    .single();
                if (isMounted && data) {
                    setSnapshot(data);
                }
            } catch (err) {
                console.warn('Analytics snapshot missing or unavailable, falling back to local computation.', err);
            }
        };
        fetchSnapshot();
        return () => { isMounted = false; };
    }, []);

    // --- REAL DATA CALCULATION ---
    const metrics = useMemo(() => {
        // Init Containers
        const dailyVolume: Record<string, number> = {};
        const fieldMissCounts: Record<string, { miss: number, total: number }> = {};
        const reviewerStats: Record<string, { count: number, totalTime: number }> = {};
        const heatmapData: Record<string, Record<string, number>> = {};

        let totalManualTime = 0;
        let countManualLeases = 0;

        let totalAiLatency = 0;
        let countAiLeases = 0;

        let totalFiles = 0;
        let abstractedCount = 0;
        let failedCount = 0;

        let aiOnlyCount = 0;
        let humanCount = 0;

        let usTemplateCount = 0;
        let euTemplateCount = 0;

        // Process Leases
        leases.forEach(lease => {
            const dateKey = lease.uploadDate.toLocaleDateString();
            const dayName = lease.uploadDate.toLocaleDateString('en-US', { weekday: 'short' });
            const hour = lease.uploadDate.getHours();
            let timeBucket = 'Morning';
            if (hour >= 12 && hour < 17) timeBucket = 'Afternoon';
            if (hour >= 17) timeBucket = 'Evening';

            if (!heatmapData[dayName]) heatmapData[dayName] = { Morning: 0, Afternoon: 0, Evening: 0 };
            heatmapData[dayName][timeBucket]++;

            // Volume
            dailyVolume[dateKey] = (dailyVolume[dateKey] || 0) + 1;
            totalFiles++;

            // Status Counts
            if (lease.status === LeaseStatus.ABSTRACTED) abstractedCount++;
            if (lease.status === LeaseStatus.FAILED) failedCount++;

            // Processing Mode
            if (lease.processingMode === 'ai') aiOnlyCount++;
            if (lease.processingMode === 'human') humanCount++;

            // Template Distribution
            if (lease.templateType === 'us') usTemplateCount++;
            else if (lease.templateType === 'eu') euTemplateCount++;

            // 1. AI Time (All leases run AI first)
            if (lease.aiModelLatency) {
                totalAiLatency += lease.aiModelLatency;
                countAiLeases++;
            }

            // 2. Manual Time (Only Human mode leases that are completed/abstracted)
            // Using timeSpent which tracks review workbench duration
            if (lease.processingMode === 'human' && lease.timeSpent && lease.timeSpent > 0) {
                totalManualTime += lease.timeSpent;
                countManualLeases++;
            }

            // 3. Reviewer Leaderboard Stats
            if (lease.reviewer && lease.processingMode === 'human' && lease.status === LeaseStatus.ABSTRACTED) {
                const rEmail = lease.reviewer.email;
                if (!reviewerStats[rEmail]) reviewerStats[rEmail] = { count: 0, totalTime: 0 };
                reviewerStats[rEmail].count++;
                if (lease.timeSpent) {
                    reviewerStats[rEmail].totalTime += lease.timeSpent;
                }
            }

            // 4. Field Level Analysis
            if (lease.abstractedData) {
                lease.abstractedData.forEach(section => {
                    section.fields.forEach(field => {
                        const fieldKey = `${section.title} - ${field.label}`;
                        const hasValue = field.value !== null && field.value !== undefined && String(field.value).trim() !== '';

                        if (!fieldMissCounts[fieldKey]) fieldMissCounts[fieldKey] = { miss: 0, total: 0 };
                        fieldMissCounts[fieldKey].total++;
                        if (!hasValue) fieldMissCounts[fieldKey].miss++;
                    });
                });
            }
        });

        // --- Aggregates ---

        // Volume Trend
        const volumeTrend = Object.entries(dailyVolume)
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .map(([date, count]) => ({
                date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: count
            }))
            .slice(-14);

        // Top Missing Fields
        const topMisses = Object.entries(fieldMissCounts)
            .map(([label, stat]) => ({ label, count: stat.miss, total: stat.total }))
            .filter(i => i.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Reviewer Leaderboard
        const topReviewers = Object.entries(reviewerStats)
            .map(([email, stat]) => ({
                email,
                name: email.split('@')[0],
                count: stat.count,
                avgTime: stat.count > 0 ? Math.round(stat.totalTime / stat.count) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Averages (Overridden by fast DB snapshots at scale)
        const avgManualReviewTime = countManualLeases > 0 ? totalManualTime / countManualLeases : 0;

        const finalTotalFiles = snapshot ? snapshot.total_leases : totalFiles;
        const finalAvgAiLatency = snapshot ? snapshot.ai_processing_avg_ms : (countAiLeases > 0 ? totalAiLatency / countAiLeases : 0);
        const finalSuccessRate = snapshot && snapshot.total_leases > 0 ? Math.round((snapshot.abstracted_leases / snapshot.total_leases) * 100) : (totalFiles > 0 ? Math.round((abstractedCount / totalFiles) * 100) : 0);

        return {
            volumeTrend,
            topMisses,
            topReviewers,
            avgManualReviewTime,
            avgAiLatency: finalAvgAiLatency,
            successRate: finalSuccessRate,
            heatmapData,
            totalFiles: finalTotalFiles,
            aiOnlyCount,
            humanCount,
            usTemplateCount,
            euTemplateCount
        };

    }, [leases, snapshot]);

    return (
        <ScrollAnimatedSection className="space-y-8 max-w-[95rem] mx-auto px-4 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                <div>
                    <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2 mb-1">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <PresentationChartLineIcon className="w-8 h-8 text-indigo-600" />
                        System Analytics
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Real-time performance telemetry from {metrics.totalFiles} processed leases.</p>
                </div>
                <div className="hidden sm:block text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Analytics Engine</span>
                    <span className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest relative z-10">AI Abstraction Time</h3>
                    <div className="mt-2 flex items-baseline gap-2 relative z-10">
                        {metrics.avgAiLatency > 0 ? (
                            <span className="text-4xl font-black text-slate-800 tracking-tighter">{formatLatency(metrics.avgAiLatency)}</span>
                        ) : (
                            <span className="text-2xl font-bold text-slate-300">N/A</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 relative z-10">Avg. machine processing</p>
                    <div className="absolute right-4 bottom-4 text-purple-100 group-hover:text-purple-50 transition-colors"><SpinnerIcon className="w-12 h-12" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest relative z-10">Manual Review Time</h3>
                    <div className="mt-2 flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-slate-800 tracking-tighter">{formatDuration(metrics.avgManualReviewTime)}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 relative z-10">Avg. human submission</p>
                    <div className="absolute right-4 bottom-4 text-indigo-100 group-hover:text-indigo-50 transition-colors"><ClockIcon className="w-12 h-12" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest relative z-10">Overall Success Rate</h3>
                    <div className="mt-2 flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-slate-800 tracking-tighter">{metrics.successRate}%</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 relative z-10">Abstracted without failure</p>
                    <div className="absolute right-4 bottom-4 text-emerald-100 group-hover:text-emerald-50 transition-colors"><CheckIcon className="w-12 h-12" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest relative z-10">Throughput Volume</h3>
                    <div className="mt-2 flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-slate-800 tracking-tighter">{metrics.totalFiles}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 relative z-10">Total leases ingested</p>
                    <div className="absolute right-4 bottom-4 text-sky-100 group-hover:text-sky-50 transition-colors"><DocumentTextIcon className="w-12 h-12" /></div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Processing Speed Comparison */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Speed Advantage</h3>
                            <p className="text-sm text-slate-500">Comparing AI latency vs Human review duration.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <SpeedComparisonChart humanTime={metrics.avgManualReviewTime} aiTime={metrics.avgAiLatency} />
                    </div>
                </div>

                {/* 2. Processing Mode Distribution */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Processing Modes</h3>
                        <p className="text-sm text-slate-500">Workflow distribution.</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <DistributionBar label="AI Only" count={metrics.aiOnlyCount} total={metrics.totalFiles} colorClass="bg-purple-500" />
                        <DistributionBar label="Human Review" count={metrics.humanCount} total={metrics.totalFiles} colorClass="bg-indigo-500" />
                    </div>
                </div>

                {/* 3. Template Usage & Volume */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col h-[24rem]">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Template Usage</h3>
                        <p className="text-sm text-slate-500">Document types processed.</p>
                    </div>
                    <div className="flex-1">
                        <DistributionBar label="US Standard" count={metrics.usTemplateCount} total={metrics.totalFiles} colorClass="bg-sky-500" />
                        <DistributionBar label="EU / UK" count={metrics.euTemplateCount} total={metrics.totalFiles} colorClass="bg-blue-500" />
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Volume Trend (14 Days)</h4>
                            <div className="h-24">
                                <TrendChart data={metrics.volumeTrend} color="#6366f1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Reviewer Leaderboard */}
                <div className="bg-slate-900 rounded-3xl shadow-xl p-8 flex flex-col text-white h-[24rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                            <UsersIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Top Reviewers</h3>
                            <p className="text-xs text-slate-400">By volume & efficiency.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                        {metrics.topReviewers.length === 0 ? (
                            <div className="text-slate-500 text-sm italic text-center py-10">No reviewer data available yet.</div>
                        ) : (
                            metrics.topReviewers.map((reviewer, idx) => (
                                <div key={idx} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-slate-700 text-slate-300'}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-200">{reviewer.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{reviewer.count} Leases</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold text-emerald-400">{formatDuration(reviewer.avgTime)}</p>
                                        <p className="text-[10px] text-slate-500">avg. review</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 5. Top Missing Fields (Problem Areas) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col h-[24rem]">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                            Drift Analysis
                        </h3>
                        <p className="text-sm text-slate-500">Fields most frequently missing or empty.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        <MissingFieldsChart data={metrics.topMisses} />
                    </div>
                </div>

                {/* 6. Heatmap (Extraordinary Feature) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col lg:col-span-3">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Peak Load Heatmap</h3>
                        <p className="text-sm text-slate-500">Upload density by day and time.</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <HeatmapGrid data={metrics.heatmapData} />
                        <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-slate-400">
                            <span>Low Activity</span>
                            <div className="w-32 h-1.5 rounded-full bg-gradient-to-r from-indigo-600/5 to-indigo-600"></div>
                            <span>High Activity</span>
                        </div>
                    </div>
                </div>

            </div>
        </ScrollAnimatedSection>
    );
};
