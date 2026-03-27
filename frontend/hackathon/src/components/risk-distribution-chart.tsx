"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ChartDataPoint, RiskLevel } from "@/types/pfmea"

/**
 * RiskDistributionChart Component
 * 
 * Displays a bar chart showing the distribution of PFMEA items by risk level.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * Features:
 * - Color-coded bars by risk level (remote=green, low=yellow, moderate=orange, high=red, very_high=dark red)
 * - Click handler for segment selection to filter data table
 * - Tooltip showing count and percentage
 * - Responsive design
 */

interface RiskDistributionChartProps {
  data: ChartDataPoint[]
  onSegmentClick?: (riskLevel: RiskLevel) => void
}

const chartConfig = {
  value: {
    label: "Count",
  },
  remote: {
    label: "Remote",
    color: "hsl(142, 76%, 36%)",
  },
  low: {
    label: "Low",
    color: "hsl(48, 96%, 53%)",
  },
  moderate: {
    label: "Moderate",
    color: "hsl(25, 95%, 53%)",
  },
  high: {
    label: "High",
    color: "hsl(0, 84%, 60%)",
  },
  very_high: {
    label: "Very High",
    color: "hsl(0, 63%, 31%)",
  },
} satisfies ChartConfig

export function RiskDistributionChart({
  data,
  onSegmentClick,
}: RiskDistributionChartProps) {
  const handleBarClick = (entry: any) => {
    if (onSegmentClick && entry && entry.name) {
      onSegmentClick(entry.name as RiskLevel)
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <CardDescription>
          Distribution of PFMEA items by risk level
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Format risk level names for display
                const config = chartConfig[value as keyof typeof chartConfig]
                return config && 'label' in config ? String(config.label) : value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const config = chartConfig[name as keyof typeof chartConfig]
                    const label = config && 'label' in config ? String(config.label) : name
                    const percentage = item.payload?.percentage ?? 0
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <span>{label}</span>
                        <span className="font-mono font-medium">
                          {value} ({percentage}%)
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              onClick={(data) => handleBarClick(data)}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
            >
              {data.map((entry, index) => (
                <rect key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
