"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactMoney, formatMoney, formatNumber } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Shared tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
  money = true,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const formatter = money
    ? (value: number | string) => formatMoney(Number(value ?? 0))
    : (value: number | string) => formatNumber(Number(value ?? 0));

  return (
    <div className="min-w-[150px] rounded-xl border border-line bg-white/95 px-3.5 py-3 shadow-pop backdrop-blur">
      {label ? (
        <p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ash-light">
          {label}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="flex items-center gap-2 text-ash">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: entry.color ?? "#175340" }}
                aria-hidden="true"
              />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums text-ink">
              {money ? formatter(entry.value ?? 0) : formatNumber(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sparkline — tiny trend line for KPI cards                          */
/* ------------------------------------------------------------------ */

export function Sparkline({
  data,
  dataKey,
  stroke = "#175340",
  className,
}: {
  data: Record<string, number | string>[];
  dataKey: string;
  stroke?: string;
  className?: string;
}) {
  const gradientId = useId();
  const hasSignal = data.some((point) => Number(point[dataKey] ?? 0) > 0);

  if (!hasSignal) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <div className={className} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={1.8}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue / profit area chart                                        */
/* ------------------------------------------------------------------ */

export type RevenuePoint = { label: string; revenue: number; profit: number; orders: number };

export function RevenueChart({ data, showProfit = true }: { data: RevenuePoint[]; showProfit?: boolean }) {
  const hasData = data.some((point) => point.revenue > 0);

  if (!hasData) {
    return (
      <div className="grid h-[280px] place-items-center text-center">
        <div>
          <p className="font-display text-[20px] text-ink">No sales in this period yet</p>
          <p className="mt-1 text-[12.5px] text-ash">
            Recorded sales will appear here as a daily revenue and profit timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#175340" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#175340" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#efe1d9" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#93a093", fontSize: 10.5 }}
            axisLine={{ stroke: "#e3ddce" }}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "#93a093", fontSize: 10.5 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) => formatCompactMoney(value)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c8bfaa", strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#175340"
            strokeWidth={2.2}
            fill="url(#revenueFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
          {showProfit ? (
            <Area
              type="monotone"
              dataKey="profit"
              name="Gross profit"
              stroke="#121916"
              strokeWidth={1.6}
              strokeDasharray="4 3"
              fill="none"
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment mix donut                                                  */
/* ------------------------------------------------------------------ */

const DONUT_COLORS = ["#175340", "#121916", "#c8a35f", "#b9cfc0", "#5f6b62"];

export function PaymentDonut({
  data,
}: {
  data: { method: string; count: number; revenue: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  if (!total) {
    return (
      <div className="grid h-[220px] place-items-center text-center">
        <p className="max-w-[220px] text-[12.5px] text-ash">No payments recorded in this period.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="method"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2.5}
            >
              {data.map((entry, index) => (
                <Cell key={entry.method} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ash-light">
              Revenue
            </p>
            <p className="mt-1 font-display text-[22px] leading-none text-ink tabular-nums">
              {formatCompactMoney(total)}
            </p>
          </div>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {data.map((entry, index) => (
          <li key={entry.method} className="flex items-center gap-2.5 text-[12px]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-ash">{entry.method}</span>
            <span className="text-ash-light">{formatNumber(entry.count)}</span>
            <span className="w-[74px] text-right font-medium tabular-nums text-ink">
              {formatCompactMoney(entry.revenue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal bar chart                                               */
/* ------------------------------------------------------------------ */

export function BarList({
  data,
  emptyLabel,
}: {
  data: { name: string; value: number; hint?: string }[];
  emptyLabel: string;
}) {
  if (!data.length) {
    return (
      <div className="grid h-[200px] place-items-center">
        <p className="text-[12.5px] text-ash">{emptyLabel}</p>
      </div>
    );
  }

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3.5">
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
            <span className="truncate text-ink">{item.name}</span>
            <span className="shrink-0 tabular-nums text-ash">
              {item.hint ?? formatCompactMoney(item.value)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-champagne transition-[width] duration-700"
              style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vertical category chart                                            */
/* ------------------------------------------------------------------ */

export function CategoryBarChart({ data }: { data: { name: string; quantity: number; revenue: number }[] }) {
  if (!data.length) {
    return (
      <div className="grid h-[240px] place-items-center">
        <p className="text-[12.5px] text-ash">No category sales in this period.</p>
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#efe1d9" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#93a093", fontSize: 10.5 }}
            axisLine={{ stroke: "#e3ddce" }}
            tickLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={52}
          />
          <YAxis
            tick={{ fill: "#93a093", fontSize: 10.5 }}
            axisLine={false}
            tickLine={false}
            width={48}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip money={false} />} cursor={{ fill: "#f2ece1" }} />
          <Bar dataKey="quantity" name="Units sold" fill="#175340" radius={[5, 5, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock by gender                                                    */
/* ------------------------------------------------------------------ */

export function GenderSplit({ data }: { data: { name: string; units: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.units, 0);
  const colors: Record<string, string> = {
    Women: "#175340",
    Men: "#121916",
    Unisex: "#c8a35f",
  };

  if (!total) {
    return <p className="py-8 text-center text-[12.5px] text-ash">No stock on hand.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {data.map((item) => (
          <div
            key={item.name}
            style={{
              width: `${(item.units / total) * 100}%`,
              background: colors[item.name] ?? "#c8bfaa",
            }}
            title={`${item.name}: ${item.units}`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-[12px] text-ash">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: colors[item.name] ?? "#c8bfaa" }}
              aria-hidden="true"
            />
            {item.name}
            <span className="font-medium tabular-nums text-ink">{formatNumber(item.units)}</span>
            <span className="text-ash-light">{Math.round((item.units / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
