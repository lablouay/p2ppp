"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartPoint {
  label: string
  value: number
}

interface AdminOverviewChartsProps {
  signups: ChartPoint[]
  deposits: ChartPoint[]
  withdrawals: ChartPoint[]
  vipUpgrades: ChartPoint[]
}

export default function AdminOverviewCharts({
  signups,
  deposits,
  withdrawals,
  vipUpgrades,
}: AdminOverviewChartsProps) {
  const charts = [
    { title: "New signups (7 days)", data: signups, color: "#d4a017" },
    { title: "Approved deposits (7 days)", data: deposits, color: "#22c55e" },
    { title: "Approved withdrawals (7 days)", data: withdrawals, color: "#ef4444" },
    { title: "VIP upgrades volume (7 days)", data: vipUpgrades, color: "#8b5cf6" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {charts.map((chart) => (
        <div key={chart.title} className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">{chart.title}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart.data}>
                <defs>
                  <linearGradient id={`grad-${chart.title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chart.color}
                  fill={`url(#grad-${chart.title})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}

      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">Deposits vs withdrawals (7 days)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={deposits.map((d, i) => ({
                label: d.label,
                deposits: d.value,
                withdrawals: withdrawals[i]?.value ?? 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="deposits" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
