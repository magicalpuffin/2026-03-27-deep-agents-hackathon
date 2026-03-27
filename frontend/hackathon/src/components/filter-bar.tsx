"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { XIcon } from "lucide-react"
import type { Procedure, RiskLevel, ProcessType } from "@/types/pfmea"

/**
 * FilterBar component props
 * Implements Requirements 7.1, 7.4, 10.1, 10.2, 10.4
 */
interface FilterBarProps {
  procedures: Procedure[]
  selectedProcedureId: string | 'all'
  selectedRiskLevels: RiskLevel[]
  selectedSeverities: number[]
  selectedProcessTypes: ProcessType[]
  onProcedureChange: (id: string | 'all') => void
  onRiskLevelsChange: (levels: RiskLevel[]) => void
  onSeveritiesChange: (severities: number[]) => void
  onProcessTypesChange: (types: ProcessType[]) => void
  onClearFilters: () => void
}

/**
 * Risk level options with display labels
 */
const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' },
]

/**
 * Severity options with display labels
 */
const SEVERITIES: { value: number; label: string }[] = [
  { value: 1, label: 'Negligible (1)' },
  { value: 2, label: 'Minor (2)' },
  { value: 3, label: 'Moderate (3)' },
  { value: 4, label: 'Critical (4)' },
  { value: 5, label: 'Catastrophic (5)' },
]

/**
 * Process type options with display labels
 */
const PROCESS_TYPES: { value: ProcessType; label: string }[] = [
  { value: 'assembly', label: 'Assembly' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'calibration', label: 'Calibration' },
  { value: 'test', label: 'Test' },
]

/**
 * FilterBar component for PFMEA dashboard
 * 
 * Provides interactive filter controls for:
 * - Procedure selection (Requirement 10.1, 10.2)
 * - Risk level multi-select (Requirement 7.1)
 * - Severity multi-select (Requirement 7.1)
 * - Process type multi-select (Requirement 7.1)
 * - Clear filters button (Requirement 7.4)
 * - Active filter count badge (Requirement 10.4)
 */
export function FilterBar({
  procedures,
  selectedProcedureId,
  selectedRiskLevels,
  selectedSeverities,
  selectedProcessTypes,
  onProcedureChange,
  onRiskLevelsChange,
  onSeveritiesChange,
  onProcessTypesChange,
  onClearFilters,
}: FilterBarProps) {
  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (selectedProcedureId !== 'all') count++
    if (selectedRiskLevels.length > 0) count++
    if (selectedSeverities.length > 0) count++
    if (selectedProcessTypes.length > 0) count++
    return count
  }, [selectedProcedureId, selectedRiskLevels, selectedSeverities, selectedProcessTypes])

  // Handle risk level checkbox toggle
  const handleRiskLevelToggle = (level: RiskLevel) => {
    if (selectedRiskLevels.includes(level)) {
      onRiskLevelsChange(selectedRiskLevels.filter((l) => l !== level))
    } else {
      onRiskLevelsChange([...selectedRiskLevels, level])
    }
  }

  // Handle severity checkbox toggle
  const handleSeverityToggle = (severity: number) => {
    if (selectedSeverities.includes(severity)) {
      onSeveritiesChange(selectedSeverities.filter((s) => s !== severity))
    } else {
      onSeveritiesChange([...selectedSeverities, severity])
    }
  }

  // Handle process type checkbox toggle
  const handleProcessTypeToggle = (type: ProcessType) => {
    if (selectedProcessTypes.includes(type)) {
      onProcessTypesChange(selectedProcessTypes.filter((t) => t !== type))
    } else {
      onProcessTypesChange([...selectedProcessTypes, type])
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        {/* Header with title and clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7"
            >
              <XIcon className="mr-1.5" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter controls grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Procedure selector - Requirement 10.1, 10.2 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="procedure-select" className="text-xs text-muted-foreground">
              Procedure
            </Label>
            <Select
              value={selectedProcedureId}
              onValueChange={onProcedureChange}
            >
              <SelectTrigger id="procedure-select" className="w-full">
                <SelectValue placeholder="Select procedure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Procedures</SelectItem>
                {procedures.map((procedure) => (
                  <SelectItem key={procedure.procedure_id} value={procedure.procedure_id}>
                    {procedure.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Risk level multi-select - Requirement 7.1 */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Risk Level
            </Label>
            <div className="flex flex-col gap-2 rounded-lg border border-input bg-transparent p-2">
              {RISK_LEVELS.map((risk) => (
                <div key={risk.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`risk-${risk.value}`}
                    checked={selectedRiskLevels.includes(risk.value)}
                    onCheckedChange={() => handleRiskLevelToggle(risk.value)}
                  />
                  <Label
                    htmlFor={`risk-${risk.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {risk.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Severity multi-select - Requirement 7.1 */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Severity
            </Label>
            <div className="flex flex-col gap-2 rounded-lg border border-input bg-transparent p-2">
              {SEVERITIES.map((severity) => (
                <div key={severity.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`severity-${severity.value}`}
                    checked={selectedSeverities.includes(severity.value)}
                    onCheckedChange={() => handleSeverityToggle(severity.value)}
                  />
                  <Label
                    htmlFor={`severity-${severity.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {severity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Process type multi-select - Requirement 7.1 */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Process Type
            </Label>
            <div className="flex flex-col gap-2 rounded-lg border border-input bg-transparent p-2">
              {PROCESS_TYPES.map((type) => (
                <div key={type.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={selectedProcessTypes.includes(type.value)}
                    onCheckedChange={() => handleProcessTypeToggle(type.value)}
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
