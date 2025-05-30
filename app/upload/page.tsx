"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, ImageIcon, CheckCircle, AlertCircle, X, Loader2, Camera, Scan } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"

interface UploadedFile {
  file: File
  preview: string
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  id: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
      progress: 0,
      id: Math.random().toString(36).substr(2, 9),
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "text/*": [".txt"],
    },
    multiple: true,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const uploadFiles = async () => {
    if (!user) return

    setIsProcessing(true)
    const supabase = getSupabaseClient()

    for (const fileItem of files) {
      if (fileItem.status !== "pending") continue

      try {
        // Update status to uploading
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, status: "uploading", progress: 25 } : f)))

        // Upload file to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${fileItem.file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("schedules")
          .upload(fileName, fileItem.file)

        if (uploadError) throw uploadError

        // Update progress
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, progress: 50 } : f)))

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("schedules").getPublicUrl(fileName)

        // Save to database
        const { error: dbError } = await supabase.from("schedules").insert({
          user_id: user.id,
          file_name: fileItem.file.name,
          file_url: publicUrl,
          processed: false,
        })

        if (dbError) throw dbError

        // Update status to processing (simulate OCR processing)
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, status: "processing", progress: 75 } : f)))

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Mark as completed
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, status: "completed", progress: 100 } : f)))
      } catch (error) {
        console.error("Upload error:", error)
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, status: "error", progress: 0 } : f)))
      }
    }

    setIsProcessing(false)
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="h-5 w-5 text-gray-500" />
      case "uploading":
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return "Ready to upload"
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing with AI..."
      case "completed":
        return "Completed"
      case "error":
        return "Error occurred"
    }
  }

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "uploading":
      case "processing":
        return "default"
      case "completed":
        return "default"
      case "error":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload your class schedule and let AI organize it for you
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </CardTitle>
          <CardDescription>
            Drag and drop your schedule files or click to browse. Supports PDF, images, and text files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">or click to browse your computer</p>
              </div>
              <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  PDF
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Text
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            AI-Powered Processing
          </CardTitle>
          <CardDescription>Our AI will automatically extract and organize your schedule information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">OCR Scanning</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extract text from images and PDFs</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Scan className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Smart Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Identify classes, times, and locations</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Auto Organization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create calendar events automatically</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Track the progress of your file uploads and processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">{getStatusIcon(fileItem.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileItem.file.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(fileItem.status)}>{getStatusText(fileItem.status)}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                          disabled={fileItem.status === "uploading" || fileItem.status === "processing"}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {(fileItem.status === "uploading" || fileItem.status === "processing") && (
                      <Progress value={fileItem.progress} className="h-2" />
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">{files.length} file(s) selected</p>
              <Button
                onClick={uploadFiles}
                disabled={files.length === 0 || isProcessing || files.every((f) => f.status !== "pending")}
                className="flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? "Processing..." : "Upload & Process"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
