/**
 * Example usage of FilterBar component
 * This file demonstrates how to integrate FilterBar into a dashboard page
 */

import { useState } from 'react'
import { FilterBar } from './filter-bar'
import type { Procedure, RiskLevel, ProcessType } from '@/types/pfmea'

export function FilterBarExample() {
  // Mock procedures data
  const procedures: Procedure[] = [
    {
      procedure_id: 'proc-1',
      title: 'Linear Accelerator Alignment',
      file_path: '/procedures/linac-alignment.md',
    },
    {
      procedure_id: 'proc-2',
      title: 'Radiation Safety Check',
      file_path: '/procedures/radiation-safety.md',
    },
    {
      procedure_id: 'proc-3',
      title: 'Beam Calibration',
      file_path: '/procedures/beam-calibration.md',
    },
  ]

  // Filter state
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | 'all'>('all')
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<number[]>([])
  const [selectedProcessTypes, setSelectedProcessTypes] = useState<ProcessType[]>([])

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedProcedureId('all')
    setSelectedRiskLevels([])
    setSelectedSeverities([])
    setSelectedProcessTypes([])
  }

  return (
    <div className="space-y-4">
      <FilterBar
        procedures={procedures}
        selectedProcedureId={selectedProcedureId}
        selectedRiskLevels={selectedRiskLevels}
        selectedSeverities={selectedSeverities}
        selectedProcessTypes={selectedProcessTypes}
        onProcedureChange={setSelectedProcedureId}
        onRiskLevelsChange={setSelectedRiskLevels}
        onSeveritiesChange={setSelectedSeverities}
        onProcessTypesChange={setSelectedProcessTypes}
        onClearFilters={handleClearFilters}
      />

      {/* Display current filter state for demonstration */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-sm font-semibold">Current Filter State:</h3>
        <pre className="text-xs">
          {JSON.stringify(
            {
              selectedProcedureId,
              selectedRiskLevels,
              selectedSeverities,
              selectedProcessTypes,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}
