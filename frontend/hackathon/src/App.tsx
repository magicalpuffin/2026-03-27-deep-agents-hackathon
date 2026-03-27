import type { CSSProperties } from "react"
import { useState, useMemo, useEffect, useCallback } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FilterBar } from "@/components/filter-bar"
import { RiskDistributionChart } from "@/components/risk-distribution-chart"
import { SeverityDistributionChart } from "@/components/severity-distribution-chart"
import { ProcessTypeChart } from "@/components/process-type-chart"
import { FileUpload } from "@/components/file-upload"

import { fetchProcedures, fetchProcedurePFMEA, clearCache } from "@/lib/api-client"
import { prepareChartData } from "@/lib/filters"
import type { RiskLevel, ProcessType, PFMEAItem, Procedure } from "@/types/pfmea"

export function App() {
  // Data state
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [pfmeaItems, setPfmeaItems] = useState<PFMEAItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | "all">("all")
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<number[]>([])
  const [selectedProcessTypes, setSelectedProcessTypes] = useState<ProcessType[]>([])

  // Load all data from the API
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const procs = await fetchProcedures()
      setProcedures(procs)

      // Fetch pFMEA items for all procedures
      const allItems: PFMEAItem[] = []
      for (const proc of procs) {
        try {
          const items = await fetchProcedurePFMEA(proc.procedure_id)
          allItems.push(...items)
        } catch {
          console.warn(`Failed to fetch pFMEA for ${proc.procedure_id}`)
        }
      }
      setPfmeaItems(allItems)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter items by selected procedure
  const filteredItems = useMemo(() => {
    if (selectedProcedureId === "all") return pfmeaItems
    return pfmeaItems.filter((item) => item.procedure_id === selectedProcedureId)
  }, [pfmeaItems, selectedProcedureId])

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedProcedureId("all")
    setSelectedRiskLevels([])
    setSelectedSeverities([])
    setSelectedProcessTypes([])
  }

  // Prepare chart data from filtered items
  const riskData = useMemo(
    () => prepareChartData(filteredItems, "risk_level"),
    [filteredItems]
  )
  const severityData = useMemo(
    () => prepareChartData(filteredItems, "severity"),
    [filteredItems]
  )
  const processTypeData = useMemo(
    () => prepareChartData(filteredItems, "process_type"),
    [filteredItems]
  )

  // Handle chart clicks
  const handleRiskLevelClick = (riskLevel: RiskLevel) => {
    setSelectedRiskLevels([riskLevel])
  }

  const handleProcessTypeClick = (processType: ProcessType) => {
    setSelectedProcessTypes([processType])
  }

  // Handle completed upload — refresh data and select the new procedure
  const handleJobComplete = async (procedureId: string) => {
    clearCache()
    await loadData()
    setSelectedProcedureId(procedureId)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold mb-2">PFMEA Dashboard</h1>
                <p className="text-muted-foreground mb-4">
                  Process Failure Mode and Effects Analysis - Interactive Dashboard
                </p>
              </div>

              {/* File Upload */}
              <div className="px-4 lg:px-6">
                <FileUpload onJobComplete={handleJobComplete} />
              </div>

              {/* Filter Bar */}
              <div className="px-4 lg:px-6">
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
              </div>

              {/* Charts Grid */}
              <div className="px-4 lg:px-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Loading data...
                  </div>
                ) : pfmeaItems.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    No pFMEA data yet. Upload a procedure file to get started.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <RiskDistributionChart
                      data={riskData}
                      onSegmentClick={handleRiskLevelClick}
                    />
                    <SeverityDistributionChart data={severityData} />
                    <ProcessTypeChart
                      data={processTypeData}
                      onSegmentClick={handleProcessTypeClick}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
