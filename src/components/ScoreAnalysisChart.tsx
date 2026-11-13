'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2,
  LineChart as LineChartIcon,
  Play
} from 'lucide-react';
import { PictureGridItem, getStoredAttempts, StoredAttempt } from '@/lib/guestStorage';
import { Button, TagChip, CardBase } from '@/components/ui';

interface ScoreAnalysisChartProps {
  items: PictureGridItem[];
  attempts?: StoredAttempt[];
  lang?: 'en' | 'hi';
}

interface AttemptDataPoint {
  index: number;
  ppdtNumber: number;
  pictureId: string;
  score: number;
  date?: string;
  verdict?: string;
  attemptId?: string;
}

export default function ScoreAnalysisChart({ items, attempts, lang = 'en' }: ScoreAnalysisChartProps) {
  const router = useRouter();

  // Axis orientation: 'standard' (Marks on Y, PPDT on X as in Excel) vs 'inverted' (PPDT on Y, Marks on X)
  const [orientation, setOrientation] = useState<'standard' | 'inverted'>('standard');
  const [viewMode, setViewMode] = useState<'by-picture' | 'all-attempts'>('by-picture');
  const [hoveredPoint, setHoveredPoint] = useState<AttemptDataPoint | null>(null);

  // Local fallback attempts if not provided by parent
  const [localAttempts, setLocalAttempts] = useState<StoredAttempt[]>(() => attempts ?? getStoredAttempts());

  useEffect(() => {
    if (attempts !== undefined) {
      setLocalAttempts(attempts);
    }
  }, [attempts]);

  useEffect(() => {
    const handleUpdate = () => {
      if (attempts === undefined) {
        setLocalAttempts(getStoredAttempts());
      }
    };
    window.addEventListener('attempts-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('attempts-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [attempts]);

  const attemptsList = attempts ?? localAttempts;

  // Compute strictly the user's real attempted points
  const dataPoints: AttemptDataPoint[] = useMemo(() => {
    // Source 1: Check attemptsList
    if (attemptsList.length > 0) {
      if (viewMode === 'all-attempts') {
        // Chronological: oldest to newest
        const chronological = [...attemptsList].reverse();
        return chronological.map((att, idx) => {
          const numMatch = att.pictureId.match(/\d+/);
          const picNum = numMatch ? parseInt(numMatch[0], 10) : idx + 1;
          const score = typeof att.score === 'number' ? att.score : (att.overall_score ?? 0);
          return {
            index: idx + 1,
            ppdtNumber: picNum,
            pictureId: att.pictureId,
            score: Number(score.toFixed(1)),
            date: att.date,
            verdict: att.ppdt_verdict,
            attemptId: att.id,
          };
        });
      }

      // Group by PPDT Picture Number: show the latest score for each picture
      const map = new Map<number, AttemptDataPoint>();
      // Process newest first so the first time we see a pictureId it's the latest attempt
      attemptsList.forEach((att) => {
        const numMatch = att.pictureId.match(/\d+/);
        const picNum = numMatch ? parseInt(numMatch[0], 10) : 1;
        const score = typeof att.score === 'number' ? att.score : (att.overall_score ?? 0);
        if (!map.has(picNum)) {
          map.set(picNum, {
            index: picNum,
            ppdtNumber: picNum,
            pictureId: att.pictureId,
            score: Number(score.toFixed(1)),
            date: att.date,
            verdict: att.ppdt_verdict,
            attemptId: att.id,
          });
        }
      });

      return Array.from(map.values()).sort((a, b) => a.ppdtNumber - b.ppdtNumber);
    }

    // Source 2: Fallback to items prop if attemptsList is empty
    const attemptedFromItems = items
      .filter((item) => item.attempted && item.lastScore !== null)
      .map((item, idx) => ({
        index: idx + 1,
        ppdtNumber: item.pictureNumber,
        pictureId: item.pictureId,
        score: parseFloat(item.lastScore || '0'),
        date: item.lastAttemptedAt || undefined,
        attemptId: item.lastAttemptId || undefined,
      }));

    return attemptedFromItems.sort((a, b) => a.ppdtNumber - b.ppdtNumber);
  }, [attemptsList, items, viewMode]);

  // Aggregate Metrics strictly computed from the real attempted points
  const metrics = useMemo(() => {
    if (dataPoints.length === 0) {
      return { total: 0, avg: null, highest: null, latest: null, passRate: 0 };
    }
    const scores = dataPoints.map((d) => d.score);
    const total = dataPoints.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Number((sum / total).toFixed(1));
    const highest = Math.max(...scores);
    const latest = scores[scores.length - 1];
    const qualified = scores.filter((s) => s >= 6.0).length;
    const passRate = Math.round((qualified / total) * 100);

    return { total, avg, highest, latest, passRate };
  }, [dataPoints]);

  const handlePointClick = (pt: AttemptDataPoint) => {
    if (pt.attemptId) {
      router.push(`/result?id=${pt.attemptId}`);
    } else if (pt.ppdtNumber) {
      router.push(`/practice/${pt.ppdtNumber}`);
    }
  };

  // SVG Geometry - Standard View (Marks on Y [0-10], PPDT # on X)
  const padding = { top: 40, right: 40, bottom: 50, left: 50 };
  const minWidth = 600;
  const pointSpacing = Math.max(80, 700 / Math.max(dataPoints.length, 4));
  const chartWidth = Math.max(minWidth, padding.left + padding.right + (dataPoints.length + 1) * pointSpacing);
  const chartHeight = 360;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Y coordinate for marks (0 to 10)
  const getY = (score: number) => {
    const clamped = Math.max(0, Math.min(10, score));
    return padding.top + innerHeight - (clamped / 10) * innerHeight;
  };

  // X coordinate with balanced margin on left and right
  const getX = (index: number) => {
    if (dataPoints.length <= 1) {
      return padding.left + innerWidth / 2;
    }
    const inset = Math.min(80, innerWidth / (dataPoints.length + 1));
    const usableWidth = innerWidth - inset * 2;
    return padding.left + inset + (index / (dataPoints.length - 1)) * usableWidth;
  };

  const standardPoints = dataPoints.map((pt, i) => ({
    x: getX(i),
    y: getY(pt.score),
    data: pt,
  }));

  const standardPathD = standardPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // SVG Geometry - Inverted View (PPDT # on Y, Marks on X [0-10])
  const invPadding = { top: 40, right: 45, bottom: 45, left: 75 };
  const invPointSpacing = 50;
  const invChartHeight = Math.max(360, invPadding.top + invPadding.bottom + (dataPoints.length + 1) * invPointSpacing);
  const invChartWidth = 720;

  const invInnerWidth = invChartWidth - invPadding.left - invPadding.right;
  const invInnerHeight = invChartHeight - invPadding.top - invPadding.bottom;

  const getInvX = (score: number) => {
    const clamped = Math.max(0, Math.min(10, score));
    return invPadding.left + (clamped / 10) * invInnerWidth;
  };

  const getInvY = (index: number) => {
    if (dataPoints.length <= 1) {
      return invPadding.top + invInnerHeight / 2;
    }
    const inset = Math.min(50, invInnerHeight / (dataPoints.length + 1));
    const usableHeight = invInnerHeight - inset * 2;
    return invPadding.top + inset + (index / (dataPoints.length - 1)) * usableHeight;
  };

  const invertedPoints = dataPoints.map((pt, i) => ({
    x: getInvX(pt.score),
    y: getInvY(i),
    data: pt,
  }));

  const invertedPathD = invertedPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Attempts Count */}
        <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'कुल प्रयास' : 'PPDT Attempts'}
          </span>
          <div className="text-[24px] font-bold text-ink">
            {metrics.total} <span className="text-[14px] text-steel font-normal">/ 65</span>
          </div>
          <span className="text-[12px] text-slate block truncate">
            {metrics.total > 0 ? `${metrics.total} ${metrics.total === 1 ? 'picture evaluated' : 'pictures evaluated'}` : 'No attempts yet'}
          </span>
        </div>

        {/* Card 2: Average Score */}
        <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'औसत अंक' : 'Average Score'}
          </span>
          <div className="text-[24px] font-bold text-ink">
            {metrics.avg !== null ? `${metrics.avg}` : '--'} 
            <span className="text-[14px] text-steel font-normal"> / 10</span>
          </div>
          <span className="text-[12px] text-slate block truncate">
            {metrics.avg !== null
              ? metrics.avg >= 6.0
                ? 'Strong baseline (>= 6.0)'
                : 'Scope for improvement'
              : 'Requires 1 attempt'}
          </span>
        </div>

        {/* Card 3: Peak Score */}
        <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'सर्वश्रेष्ठ अंक' : 'Peak Score'}
          </span>
          <div className="text-[24px] font-bold text-primary">
            {metrics.highest !== null ? `${metrics.highest}` : '--'} 
            <span className="text-[14px] text-steel font-normal"> / 10</span>
          </div>
          <span className="text-[12px] text-slate block truncate">
            {metrics.total > 0 ? `${metrics.passRate}% sessions >= 6.0` : 'No scores logged'}
          </span>
        </div>

        {/* Card 4: Latest Score */}
        <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'हालिया अंक' : 'Latest Score'}
          </span>
          <div className="text-[24px] font-bold text-ink">
            {metrics.latest !== null ? `${metrics.latest}` : '--'} 
            <span className="text-[14px] text-steel font-normal"> / 10</span>
          </div>
          <span className="text-[12px] text-slate block truncate">
            {metrics.latest !== null
              ? metrics.latest >= 6.0
                ? 'Screen-in threshold met'
                : 'Below 6.0 threshold'
              : 'No sessions yet'}
          </span>
        </div>
      </div>

      {/* Main Graph Card */}
      <CardBase className="p-4 sm:p-6 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-[16px] text-ink">
              {lang === 'hi' ? 'PPDT अंक विश्लेषण' : 'PPDT Score Trajectory'}
            </span>
            <TagChip color="purple">
              {metrics.total} {metrics.total === 1 ? 'Attempt' : 'Attempts'}
            </TagChip>
          </div>

          {metrics.total > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Orientation Toggle */}
              <div className="flex items-center p-0.5 rounded-md bg-surface border border-hairline">
                <button
                  type="button"
                  onClick={() => setOrientation('standard')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    orientation === 'standard'
                      ? 'bg-[#18181b] text-white font-semibold shadow-xs dark:bg-primary dark:text-white'
                      : 'text-slate hover:text-ink dark:text-slate dark:hover:text-white'
                  }`}
                  title="Marks on Vertical Y Axis, PPDT Number on Horizontal X Axis (as in Excel)"
                >
                  Standard (Marks on Y)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('inverted')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    orientation === 'inverted'
                      ? 'bg-[#18181b] text-white font-semibold shadow-xs dark:bg-primary dark:text-white'
                      : 'text-slate hover:text-ink dark:text-slate dark:hover:text-white'
                  }`}
                  title="PPDT Number on Vertical Y Axis, Marks on Horizontal X Axis"
                >
                  Inverted (PPDT on Y)
                </button>
              </div>

              {/* View Mode Toggle if multiple attempts */}
              {attemptsList.length > dataPoints.length && (
                <div className="flex items-center p-0.5 rounded-md bg-surface border border-hairline">
                  <button
                    type="button"
                    onClick={() => setViewMode('by-picture')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'by-picture'
                        ? 'bg-[#18181b] text-white font-semibold shadow-xs dark:bg-primary dark:text-white'
                        : 'text-slate hover:text-ink dark:text-slate dark:hover:text-white'
                    }`}
                  >
                    By Picture
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('all-attempts')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'all-attempts'
                        ? 'bg-[#18181b] text-white font-semibold shadow-xs dark:bg-primary dark:text-white'
                        : 'text-slate hover:text-ink dark:text-slate dark:hover:text-white'
                    }`}
                  >
                    All Sessions ({attemptsList.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chart Body */}
        {metrics.total === 0 ? (
          /* EMPTY STATE: When user has not attempted any PPDTs yet */
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <LineChartIcon className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-[18px] font-semibold text-ink">
                {lang === 'hi' ? 'कोई PPDT प्रयास दर्ज नहीं' : 'No Attempted PPDTs Yet'}
              </h3>
              <p className="text-[14px] text-slate leading-relaxed">
                {lang === 'hi'
                  ? 'जब आप किसी चित्र का अभ्यास पूरा करेंगे, तो आपके प्राप्तांकों का ग्राफ और प्रगति यहाँ स्वतः दिखाई देगी।'
                  : 'Your marks vs. PPDT number graph will be plotted here as soon as you complete your first timed practice session.'}
              </p>
            </div>
            <Link href="/practice/1" className="inline-block pt-2">
              <Button variant="primary">
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                <span>{lang === 'hi' ? 'PPDT 1 का अभ्यास शुरू करें' : 'Start PPDT 1 Practice'}</span>
              </Button>
            </Link>
          </div>
        ) : orientation === 'standard' ? (
          /* STANDARD ORIENTATION: Marks on Y (0-10), PPDT Number on X (Matches Excel screenshot) */
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div style={{ minWidth: `${chartWidth}px` }} className="relative select-none">
              {/* Centered Chart Title: Marks */}
              <div className="text-center font-bold text-[18px] text-ink tracking-wide mb-1">
                Marks
              </div>

              <svg
                width={chartWidth}
                height={chartHeight}
                className="overflow-visible block mx-auto"
              >
                <defs>
                  <linearGradient id="chartBlueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines (0 to 10 marks) */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                  const y = getY(val);
                  const isBenchmark = val === 6; // 6.0 SSB cutoff
                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke={isBenchmark ? '#2563eb' : 'currentColor'}
                        strokeOpacity={isBenchmark ? 0.35 : 0.08}
                        strokeDasharray={isBenchmark ? '4 2' : 'none'}
                        strokeWidth={isBenchmark ? 1.5 : 1}
                      />
                      {/* Left Axis Score Label */}
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="12"
                        className="fill-slate font-medium"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Baseline Line at 0 */}
                <line
                  x1={padding.left}
                  y1={getY(0)}
                  x2={chartWidth - padding.right}
                  y2={getY(0)}
                  stroke="currentColor"
                  strokeOpacity={0.25}
                  strokeWidth={1.5}
                />

                {/* Gradient Fill under Line */}
                {standardPoints.length > 1 && (
                  <path
                    d={`${standardPathD} L ${standardPoints[standardPoints.length - 1].x} ${getY(0)} L ${standardPoints[0].x} ${getY(0)} Z`}
                    fill="url(#chartBlueGradient)"
                  />
                )}

                {/* Blue Connecting Line */}
                {standardPoints.length > 1 && (
                  <path
                    d={standardPathD}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points + Direct Value Labels */}
                {standardPoints.map((pt, idx) => {
                  const isHovered = hoveredPoint?.ppdtNumber === pt.data.ppdtNumber && hoveredPoint?.attemptId === pt.data.attemptId;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredPoint(pt.data)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => handlePointClick(pt.data)}
                    >
                      {/* Tick Line to X Axis */}
                      <line
                        x1={pt.x}
                        y1={getY(0)}
                        x2={pt.x}
                        y2={getY(0) + 6}
                        stroke="currentColor"
                        strokeOpacity={0.3}
                      />
                      {/* X Axis Label: PPDT Number */}
                      <text
                        x={pt.x}
                        y={getY(0) + 22}
                        textAnchor="middle"
                        fontSize="12"
                        className="fill-charcoal font-semibold"
                      >
                        PPDT {pt.data.ppdtNumber}
                      </text>

                      {/* Direct Score Label Above Point (matching Excel screenshot) */}
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill={isHovered ? '#1d4ed8' : pt.data.score >= 6 ? '#059669' : '#dc2626'}
                      >
                        {pt.data.score}
                      </text>

                      {/* Hover Halo Ring */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={10}
                          fill="#3b82f6"
                          fillOpacity={0.25}
                        />
                      )}

                      {/* Circular Dot Marker */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4.5}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Axis Captions */}
              <div className="flex items-center justify-between text-[12px] text-steel px-4 pt-1">
                <span>&larr; Vertical: Marks (0 - 10)</span>
                <span className="font-semibold text-charcoal">Horizontal: PPDT Number Attempted &rarr;</span>
              </div>
            </div>
          </div>
        ) : (
          /* INVERTED ORIENTATION: PPDT Number on Vertical Y Axis, Marks on Horizontal X Axis */
          <div className="w-full overflow-y-auto max-h-[600px] pb-2 scrollbar-thin">
            <div style={{ minHeight: `${invChartHeight}px` }} className="relative select-none">
              <div className="text-center font-bold text-[18px] text-ink tracking-wide mb-2">
                Marks (Horizontal) vs PPDT Number (Vertical)
              </div>

              <svg
                width={invChartWidth}
                height={invChartHeight}
                className="overflow-visible block mx-auto"
              >
                {/* Vertical Gridlines for Marks 0 to 10 */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                  const x = getInvX(val);
                  const isBenchmark = val === 6;
                  return (
                    <g key={val}>
                      <line
                        x1={x}
                        y1={invPadding.top}
                        x2={x}
                        y2={invChartHeight - invPadding.bottom}
                        stroke={isBenchmark ? '#2563eb' : 'currentColor'}
                        strokeOpacity={isBenchmark ? 0.35 : 0.08}
                        strokeDasharray={isBenchmark ? '4 2' : 'none'}
                        strokeWidth={isBenchmark ? 1.5 : 1}
                      />
                      <text
                        x={x}
                        y={invPadding.top - 10}
                        textAnchor="middle"
                        fontSize="12"
                        className="fill-slate font-medium"
                      >
                        {val}
                      </text>
                      <text
                        x={x}
                        y={invChartHeight - invPadding.bottom + 18}
                        textAnchor="middle"
                        fontSize="12"
                        className="fill-slate font-medium"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Connecting Line */}
                {invertedPoints.length > 1 && (
                  <path
                    d={invertedPathD}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Inverted Points */}
                {invertedPoints.map((pt, idx) => {
                  const isHovered = hoveredPoint?.ppdtNumber === pt.data.ppdtNumber && hoveredPoint?.attemptId === pt.data.attemptId;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt.data)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => handlePointClick(pt.data)}
                    >
                      {/* Y Axis Label: PPDT Number */}
                      <text
                        x={invPadding.left - 12}
                        y={pt.y + 4}
                        textAnchor="end"
                        fontSize="12"
                        className="fill-charcoal font-semibold"
                      >
                        PPDT {pt.data.ppdtNumber}
                      </text>

                      {/* Direct Score Label to Right of Point */}
                      <text
                        x={pt.x + 10}
                        y={pt.y + 4}
                        textAnchor="start"
                        fontSize="12"
                        fontWeight="700"
                        fill="#2563eb"
                      >
                        {pt.data.score}
                      </text>

                      {/* Circular Dot Marker */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4.5}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Hover Detail Card */}
        {hoveredPoint && (
          <div className="p-3 rounded-md bg-surface border border-hairline flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink text-[14px]">
                Picture {hoveredPoint.ppdtNumber}
              </span>
              <TagChip color={hoveredPoint.score >= 6 ? 'green' : 'orange'}>
                Score: {hoveredPoint.score} / 10
              </TagChip>
              {hoveredPoint.verdict && (
                <span className="text-slate font-medium">({hoveredPoint.verdict})</span>
              )}
            </div>

            {hoveredPoint.date && (
              <span className="text-slate">
                Attempted: {new Date(hoveredPoint.date).toLocaleDateString()}
              </span>
            )}

            <span className="text-primary font-medium flex items-center gap-1 cursor-pointer hover:underline">
              View attempt assessment &rarr;
            </span>
          </div>
        )}

        {/* Footer Note */}
        {metrics.total > 0 && (
          <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between text-[12px] text-slate gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span>Benchmark: 6.0+ marks is the recommended SSB screening cutoff.</span>
            </div>
            <span>Showing strictly your {metrics.total} recorded {metrics.total === 1 ? 'attempt' : 'attempts'}.</span>
          </div>
        )}
      </CardBase>
    </div>
  );
}
