"use client"

import { Pie, PieChart, Cell } from "recharts"

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
import type { ChartDataPoint, ProcessType } from "@/types/pfmea"

/**
 * ProcessTypeChart Component
 * 
 * Displays a pie chart showing the distribution of PFMEA items by process type.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * Features:
 * - Color-coded segments by process type (assembly=blue, inspection=green, calibration=purple, test=orange)
 * - Click handler for segment selection to filter data table
 * - Tooltip showing count and percentage
 * - Responsive design
 */

interface ProcessTypeChartProps {
  data: ChartDataPoint[]
  onSegmentClick?: (processType: ProcessType) => void
}

const chartConfig = {
  value: {
    label: "Count",
  },
  assembly: {
    label: "Assembly",
    color: "hsl(221, 83%, 53%)",
  },
  inspection: {
    label: "Inspection",
    color: "hsl(142, 76%, 36%)",
  },
  calibration: {
    label: "Calibration",
    color: "hsl(280, 65%, 60%)",
  },
  test: {
    label: "Test",
    color: "hsl(25, 95%, 53%)",
  },
} satisfies ChartConfig

export function ProcessTypeChart({
  data,
  onSegmentClick,
}: ProcessTypeChartProps) {
  const handleSegmentClick = (entry: any) => {
    if (onSegmentClick && entry && entry.name) {
      onSegmentClick(entry.name as ProcessType)
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Process Type Distribution</CardTitle>
        <CardDescription>
          Distribution of PFMEA items by manufacturing process type
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
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
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              onClick={(data) => handleSegmentClick(data)}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
