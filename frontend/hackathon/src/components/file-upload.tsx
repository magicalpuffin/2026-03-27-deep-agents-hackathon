"use client"

import { useState, useRef } from "react"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { uploadFile, pollJobUntilDone } from "@/lib/api-client"

interface FileUploadProps {
  onFileUpload?: (file: File) => void
  onJobComplete?: (procedureId: string) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
}

export function FileUpload({
  onFileUpload,
  onJobComplete,
  acceptedFileTypes = ".md,.txt,.json,.docx,.pdf",
  maxFileSizeMB = 10,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSizeMB) {
      toast.error(`File size exceeds ${maxFileSizeMB}MB limit`)
      setUploadStatus("error")
      return
    }

    setSelectedFile(file)
    setUploadStatus("idle")
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus("uploading")
    setStatusMessage("Uploading file...")

    try {
      if (onFileUpload) {
        onFileUpload(selectedFile)
      }

      const uploadResult = await uploadFile(selectedFile)
      setUploadStatus("processing")
      setStatusMessage("Analyzing procedures and generating pFMEA...")
      toast.success(`File uploaded. Processing started.`)

      const jobResult = await pollJobUntilDone(uploadResult.job_id, (status) => {
        if (status.status === "processing") {
          setStatusMessage("Analyzing procedures and generating pFMEA...")
        }
      })

      if (jobResult.status === "done" && jobResult.procedure_id) {
        setUploadStatus("success")
        setStatusMessage("")
        toast.success("pFMEA analysis complete!")
        if (onJobComplete) {
          onJobComplete(jobResult.procedure_id)
        }
      } else {
        setUploadStatus("error")
        setStatusMessage(jobResult.error || "Processing failed")
        toast.error(jobResult.error || "Processing failed")
      }
    } catch (error) {
      setUploadStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Upload failed")
      toast.error("Failed to upload file")
      console.error("Upload error:", error)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Procedure File
        </CardTitle>
        <CardDescription>
          Upload a procedure file (.md, .txt, .json) to analyze PFMEA data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onClick={!selectedFile ? handleBrowseClick : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${selectedFile ? "bg-muted/50" : "cursor-pointer hover:border-primary/50 hover:bg-muted/30"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: {acceptedFileTypes.replace(/\./g, "").toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: {maxFileSizeMB}MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uploadStatus === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {uploadStatus === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={uploadStatus === "uploading"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {selectedFile && uploadStatus !== "success" && uploadStatus !== "processing" && (
            <Button
              onClick={handleUpload}
              disabled={uploadStatus === "uploading"}
              className="w-full"
            >
              {uploadStatus === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          )}

          {/* Processing Message */}
          {uploadStatus === "processing" && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{statusMessage || "Processing..."}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === "success" && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>pFMEA analysis complete! Dashboard updated.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadStatus === "error" && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{statusMessage || "Upload failed. Please try again."}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
