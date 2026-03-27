import type { CSSProperties } from "react"
import { useState, useMemo } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FilterBar } from "@/components/filter-bar"
import { RiskDistributionChart } from "@/components/risk-distribution-chart"
import { SeverityDistributionChart } from "@/components/severity-distribution-chart"
import { ProcessTypeChart } from "@/components/process-type-chart"
import { FileUpload } from "@/components/file-upload"
import { toast } from "sonner"

import { prepareChartData } from "@/lib/filters"
import type { RiskLevel, ProcessType, PFMEAItem, Procedure } from "@/types/pfmea"

// Sample PFMEA data for demonstration
const sampleProcedures: Procedure[] = [
  {
    procedure_id: "proc-1",
    title: "Linear Accelerator Alignment",
    file_path: "/procedures/linac-alignment.md",
  },
  {
    procedure_id: "proc-2",
    title: "Radiation Safety Check",
    file_path: "/procedures/radiation-safety.md",
  },
  {
    procedure_id: "proc-3",
    title: "Beam Calibration",
    file_path: "/procedures/beam-calibration.md",
  },
]

const samplePFMEAItems: PFMEAItem[] = [
  {
    item_id: "1",
    procedure_id: "proc-1",
    process_key: "step-1",
    summary: "Misalignment during assembly",
    hazard: "Beam misalignment",
    hazard_category: "Electrical",
    severity: 5,
    risk_level: "very_high",
    mitigation: "Implement automated alignment verification",
    process_type: "assembly",
  },
  {
    item_id: "2",
    procedure_id: "proc-1",
    process_key: "step-2",
    summary: "Calibration drift over time",
    hazard: "Inaccurate beam delivery",
    hazard_category: "Mechanical",
    severity: 4,
    risk_level: "high",
    mitigation: "Schedule regular calibration checks",
    process_type: "calibration",
  },
  {
    item_id: "3",
    procedure_id: "proc-2",
    process_key: "step-1",
    summary: "Radiation exposure during maintenance",
    hazard: "Personnel exposure",
    hazard_category: "Radiation",
    severity: 5,
    risk_level: "very_high",
    mitigation: "Enforce lockout/tagout procedures",
    process_type: "inspection",
  },
  {
    item_id: "4",
    procedure_id: "proc-2",
    process_key: "step-2",
    summary: "Incomplete safety checklist",
    hazard: "Missed safety hazards",
    hazard_category: "Procedural",
    severity: 3,
    risk_level: "moderate",
    mitigation: "Implement digital checklist with mandatory fields",
    process_type: "inspection",
  },
  {
    item_id: "5",
    procedure_id: "proc-3",
    process_key: "step-1",
    summary: "Beam energy variation",
    hazard: "Incorrect dose delivery",
    hazard_category: "Electrical",
    severity: 4,
    risk_level: "high",
    mitigation: "Install real-time energy monitoring",
    process_type: "test",
  },
  {
    item_id: "6",
    procedure_id: "proc-3",
    process_key: "step-2",
    summary: "Documentation error",
    hazard: "Incorrect procedure execution",
    hazard_category: "Procedural",
    severity: 2,
    risk_level: "low",
    mitigation: "Implement peer review process",
    process_type: "test",
  },
  {
    item_id: "7",
    procedure_id: "proc-1",
    process_key: "step-3",
    summary: "Component wear",
    hazard: "Equipment failure",
    hazard_category: "Mechanical",
    severity: 3,
    risk_level: "moderate",
    mitigation: "Establish preventive maintenance schedule",
    process_type: "assembly",
  },
  {
    item_id: "8",
    procedure_id: "proc-2",
    process_key: "step-3",
    summary: "Interlock bypass",
    hazard: "Safety system failure",
    hazard_category: "Electrical",
    severity: 5,
    risk_level: "very_high",
    mitigation: "Install tamper-evident seals on interlocks",
    process_type: "inspection",
  },
]

export function App() {
  // Filter state
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | "all">("all")
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<number[]>([])
  const [selectedProcessTypes, setSelectedProcessTypes] = useState<ProcessType[]>([])

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedProcedureId("all")
    setSelectedRiskLevels([])
    setSelectedSeverities([])
    setSelectedProcessTypes([])
  }

  // Prepare chart data
  const riskData = useMemo(
    () => prepareChartData(samplePFMEAItems, "risk_level"),
    []
  )
  const severityData = useMemo(
    () => prepareChartData(samplePFMEAItems, "severity"),
    []
  )
  const processTypeData = useMemo(
    () => prepareChartData(samplePFMEAItems, "process_type"),
    []
  )

  // Handle chart clicks
  const handleRiskLevelClick = (riskLevel: RiskLevel) => {
    setSelectedRiskLevels([riskLevel])
  }

  const handleProcessTypeClick = (processType: ProcessType) => {
    setSelectedProcessTypes([processType])
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file.name)
    toast.success(`Processing file: ${file.name}`)
    // TODO: Implement actual file processing logic
    // This would typically involve:
    // 1. Reading the file content
    // 2. Parsing the procedure data
    // 3. Calling the backend API to process PFMEA
    // 4. Updating the dashboard with new data
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
                <FileUpload onFileUpload={handleFileUpload} />
              </div>

              {/* Filter Bar */}
              <div className="px-4 lg:px-6">
                <FilterBar
                  procedures={sampleProcedures}
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
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
