import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadZoneProps {
  onFileSelect: (text: string) => void;
}

export const UploadZone = ({ onFileSelect }: UploadZoneProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      onFileSelect(text);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full mx-auto border-2 border-dashed border-primary/30 hover:border-primary transition-colors bg-card/50 backdrop-blur">
      <CardContent className="p-8">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center py-10 transition-all duration-300 ${
              isDragActive ? 'scale-105' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-primary">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold mb-1">
                  {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                </p>
                <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full">
                PDF, DOCX, or TXT • Max 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              disabled={isProcessing}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-primary animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="font-medium">Processing your resume...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
