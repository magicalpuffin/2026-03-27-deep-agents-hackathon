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
import type { ChartDataPoint } from "@/types/pfmea"

/**
 * SeverityDistributionChart Component
 * 
 * Displays a bar chart showing the distribution of PFMEA items by severity rating (1-5).
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * Features:
 * - Gradient color scheme (1=light green to 5=dark red)
 * - Hover tooltip with severity name, count, and percentage
 * - Responsive design
 */

interface SeverityDistributionChartProps {
  data: ChartDataPoint[]
}

const chartConfig = {
  value: {
    label: "Count",
  },
  "1": {
    label: "Negligible",
    color: "hsl(142, 76%, 36%)",
  },
  "2": {
    label: "Minor",
    color: "hsl(48, 96%, 53%)",
  },
  "3": {
    label: "Moderate",
    color: "hsl(25, 95%, 53%)",
  },
  "4": {
    label: "Critical",
    color: "hsl(0, 84%, 60%)",
  },
  "5": {
    label: "Catastrophic",
    color: "hsl(0, 63%, 31%)",
  },
} satisfies ChartConfig

export function SeverityDistributionChart({
  data,
}: SeverityDistributionChartProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
        <CardDescription>
          Distribution of PFMEA items by severity rating
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
                // Format severity level names for display
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
