# FileUpload Component

A drag-and-drop file upload component for uploading procedure files to the PFMEA dashboard.

## Features

- **Drag and Drop**: Drag files directly onto the upload zone
- **Browse Files**: Click to open file browser
- **File Validation**: Validates file size and type
- **Upload Progress**: Shows uploading, success, and error states
- **File Preview**: Displays selected file name and size
- **Toast Notifications**: User-friendly feedback via Sonner toasts
- **Responsive Design**: Works on all screen sizes

## Usage

```tsx
import { FileUpload } from '@/components/file-upload'

function MyComponent() {
  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name)
    // Process the file here
  }

  return (
    <FileUpload
      onFileUpload={handleFileUpload}
      acceptedFileTypes=".md,.txt,.json"
      maxFileSizeMB={10}
    />
  )
}
```

## Props

### `onFileUpload`
- **Type**: `(file: File) => void`
- **Required**: No
- **Description**: Callback function invoked when a file is successfully uploaded

### `acceptedFileTypes`
- **Type**: `string`
- **Required**: No
- **Default**: `".md,.txt,.json"`
- **Description**: Comma-separated list of accepted file extensions

### `maxFileSizeMB`
- **Type**: `number`
- **Required**: No
- **Default**: `10`
- **Description**: Maximum file size in megabytes

## States

The component manages the following states:

1. **Idle**: No file selected, ready for upload
2. **File Selected**: File chosen but not yet uploaded
3. **Uploading**: File is being uploaded (shows spinner)
4. **Success**: File uploaded successfully (shows checkmark)
5. **Error**: Upload failed (shows error icon)

## File Validation

The component validates:
- **File Size**: Must be under the specified `maxFileSizeMB` limit
- **File Type**: Must match one of the `acceptedFileTypes` extensions

If validation fails, an error toast is displayed and the file is rejected.

## Visual Feedback

- **Drag Over**: Border highlights when dragging a file over the drop zone
- **File Selected**: Shows file icon, name, and size
- **Uploading**: Displays spinner and "Uploading..." text
- **Success**: Green checkmark and success message
- **Error**: Red alert icon and error message

## Integration with PFMEA Dashboard

In the PFMEA Dashboard context, this component is used to:

1. Upload procedure files (.md, .txt, .json)
2. Trigger backend processing to extract PFMEA data
3. Update the dashboard with new procedure and PFMEA items
4. Refresh charts and tables with the uploaded data

### Example Integration

```tsx
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'

function Dashboard() {
  const handleFileUpload = async (file: File) => {
    try {
      // Read file content
      const content = await file.text()
      
      // Send to backend API
      const response = await fetch('/api/procedures/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: file.name,
          content: content 
        })
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      
      // Update dashboard state with new data
      setProcedures(prev => [...prev, data.procedure])
      setPFMEAItems(prev => [...prev, ...data.pfmeaItems])
      
      toast.success('Procedure uploaded and analyzed successfully')
    } catch (error) {
      toast.error('Failed to process procedure file')
      console.error(error)
    }
  }

  return <FileUpload onFileUpload={handleFileUpload} />
}
```

## Styling

The component uses:
- Tailwind CSS for styling
- shadcn/ui Card components for layout
- Lucide React icons for visual elements
- Sonner for toast notifications

## Accessibility

- Keyboard accessible (can tab to browse button)
- Screen reader friendly with semantic HTML
- Clear visual feedback for all states
- ARIA labels on interactive elements

## Dependencies

- `lucide-react`: Icons (Upload, FileText, X, CheckCircle2, AlertCircle)
- `@/components/ui/button`: Button component
- `@/components/ui/card`: Card layout components
- `sonner`: Toast notifications

## Future Enhancements

Potential improvements:
- Multiple file upload support
- Upload progress bar with percentage
- File preview for supported formats
- Batch upload with queue management
- Retry failed uploads
- Cancel ongoing uploads
