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
    <Card className="w-full max-w-2xl mx-auto border-2 border-dashed border-primary/50 hover:border-primary transition-colors">
      <CardContent className="p-8">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center py-12 transition-all duration-300 ${
              isDragActive ? 'scale-105' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-glow">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold mb-2">
                  {isDragActive ? 'Drop it like it\'s hot!' : 'Drag & drop your resume'}
                </p>
                <p className="text-muted-foreground">or click to browse</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
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
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-4 text-center animate-pulse">
            <p className="text-sm text-muted-foreground">Processing your resume...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
