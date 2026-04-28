import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import type { NetWorthPoint } from '@/types/data'

const chartConfig = {
  totalInr: {
    label: 'Net worth',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

function formatInr0(n: number) {
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

type Row = {
  t: number
  totalInr: number
  recordedAt: string
}

export function NetWorthOverTimeCard({
  history,
  recordBlockedMessage,
}: {
  history: NetWorthPoint[]
  recordBlockedMessage: string | null
}) {
  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      ),
    [history]
  )

  const chartData: Row[] = useMemo(
    () =>
      sorted.map(p => ({
        t: new Date(p.recordedAt).getTime(),
        totalInr: p.totalInr,
        recordedAt: p.recordedAt,
      })),
    [sorted]
  )

  if (sorted.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Need two snapshots to see a trend
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {sorted.length === 0 ? (
              <>
                The chart needs at least two snapshots over time. When you are
                ready, use{' '}
                <span className="font-medium text-foreground">
                  Record snapshot
                </span>{' '}
                twice (on different days or after meaningful changes) to see
                your net worth trend.
              </>
            ) : (
              <>
                You have one snapshot recorded. Add a second with{' '}
                <span className="font-medium text-foreground">
                  Record another snapshot
                </span>{' '}
                when your total has changed, or after some time, to see a
                line chart here.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recordBlockedMessage ? (
            <p className="text-sm text-muted-foreground">
              {recordBlockedMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Net worth over time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border) / 0.5)"
            />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                return new Date(value as number).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={100}
              tickMargin={4}
              tickFormatter={v => formatInr0(Number(v))}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null
                }
                const row = payload[0].payload as Row
                return (
                  <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    <p className="font-mono font-medium tabular-nums text-foreground">
                      {formatInr0(row.totalInr)}
                      <span className="ml-1.5 font-sans font-normal text-muted-foreground">
                        {new Date(row.recordedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })}
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="totalInr"
              stroke="transparent"
              fill="var(--color-totalInr)"
              fillOpacity={0.12}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="totalInr"
              stroke="var(--color-totalInr)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
