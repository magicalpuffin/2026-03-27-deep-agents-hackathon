"use client"

import { useState, useRef } from "react"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface FileUploadProps {
  onFileUpload?: (file: File) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
}

export function FileUpload({
  onFileUpload,
  acceptedFileTypes = ".md,.txt,.json",
  maxFileSizeMB = 10,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
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

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Call the callback if provided
      if (onFileUpload) {
        onFileUpload(selectedFile)
      }

      setUploadStatus("success")
      toast.success(`File "${selectedFile.name}" uploaded successfully`)
    } catch (error) {
      setUploadStatus("error")
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
          {selectedFile && uploadStatus !== "success" && (
            <Button
              onClick={handleUpload}
              disabled={uploadStatus === "uploading"}
              className="w-full"
            >
              {uploadStatus === "uploading" ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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

          {/* Success Message */}
          {uploadStatus === "success" && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>File uploaded successfully! Processing PFMEA data...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadStatus === "error" && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Upload failed. Please try again.</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
