# 🎯 Complete Technical Interview Guide: ResumeReviewer Project

## 📋 Project Overview

**ResumeReviewer** is a full-stack web application that uses AI to analyze resumes and provide constructive feedback. Built with modern React, TypeScript, Supabase, and OpenAI integration.

### 🏗️ Complete Architecture Flow

```
User Uploads Resume → PDF.js Text Extraction → Supabase Edge Function → OpenAI GPT-4 → Database Storage → Results Display
```

---

## 🔧 Core Components Deep Dive

### 1. **File Upload System** (`src/components/UploadZone.tsx`)

**Purpose**: Handles resume file uploads with text extraction

**Key Implementation Details**:
```typescript
// PDF.js configuration for text extraction
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0 
        }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText.trim());
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
```

**React Dropzone Integration**:
```typescript
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
```

**Error Handling**:
```typescript
try {
  let text: string;
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type === 'text/plain') {
    text = await file.text();
  } else {
    text = await file.text();
  }
  
  if (!text || text.trim().length === 0) {
    throw new Error('No text content found in file');
  }
  
  onFileSelect(text);
} catch (error) {
  console.error('Error reading file:', error);
  alert('Failed to read file. Please ensure it\'s a valid PDF, TXT, or DOCX file.');
}
```

### 2. **AI Analysis Pipeline** (`supabase/functions/roast-resume/index.ts`)

**Purpose**: Serverless function that processes resume text using OpenAI

**Complete Implementation**:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();
    
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('No resume text provided');
    }

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional resume reviewer. Analyze the resume and provide constructive feedback. 
            Return a JSON array with objects containing: original (the problematic text), roast (constructive feedback), and category (type of issue).`
          },
          {
            role: 'user',
            content: `Please analyze this resume and identify areas for improvement: ${resumeText}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let roasts;
    try {
      roasts = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      roasts = [{
        original: "Resume content",
        roast: aiResponse,
        category: "General Feedback"
      }];
    }

    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const roast of roasts) {
      await supabase.from('roasts').insert({
        original_text: roast.original,
        roast_feedback: roast.roast,
        roast_type: roast.category
      });
    }

    return new Response(
      JSON.stringify({ roasts }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in roast-resume function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
```

### 3. **Results Display System** (`src/pages/Roast.tsx`)

**Purpose**: Displays AI feedback in an interactive, user-friendly format

**State Management**:
```typescript
const [resumeText, setResumeText] = useState("");
const [roasts, setRoasts] = useState<RoastResult[]>([]);
const [isRoasting, setIsRoasting] = useState(false);

// Check if resume text was passed from the home page
useEffect(() => {
  if (location.state?.resumeText) {
    setResumeText(location.state.resumeText);
  }
}, [location.state]);
```

**API Integration**:
```typescript
const handleRoast = async () => {
  if (!resumeText || resumeText.trim().length === 0) {
    toast({
      title: "No resume content",
      description: "Please upload a resume file first.",
      variant: "destructive",
    });
    return;
  }

  setIsRoasting(true);

  try {
    const { data, error } = await supabase.functions.invoke('roast-resume', {
      body: { resumeText },
      headers: {
        Authorization: `Bearer ${import.meta.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (error) {
      if (error.message?.includes('Rate limit')) {
        toast({
          title: "Whoa, slow down! 🔥",
          description: "Too many roasts at once. Take a breather and try again in a moment.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Payment required')) {
        toast({
          title: "Out of roast credits",
          description: "The AI needs more fuel. Please add credits to continue roasting!",
          variant: "destructive",
        });
      } else {
        throw error;
      }
      return;
    }

    // Handle both parsed JSON and string responses
    let roastData = data;
    
    if (typeof data.roasts === 'string') {
      try {
        roastData = JSON.parse(data.roasts);
      } catch (parseError) {
        console.error('Failed to parse roasts string:', parseError);
        throw new Error('Invalid response format from server');
      }
    }
    
    if (typeof data === 'string') {
      try {
        roastData = JSON.parse(data);
      } catch (parseError) {
        console.error('Failed to parse response string:', parseError);
        throw new Error('Invalid response format from server');
      }
    }

    if (roastData?.roasts && Array.isArray(roastData.roasts)) {
      setRoasts(roastData.roasts);
      
      // Store roasts in database
      for (const roast of roastData.roasts) {
        await supabase.from('roasts').insert({
          original_text: roast.original,
          roast_feedback: roast.roast,
          roast_type: roast.category
        });
      }

      toast({
        title: "Resume roasted! 🔥",
        description: `Found ${roastData.roasts.length} areas to improve.`,
      });
    } else {
      throw new Error('Invalid response structure from server');
    }

  } catch (error) {
    console.error('Error roasting resume:', error);
    toast({
      title: "Roast failed",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsRoasting(false);
  }
};
```

**Responsive Grid Layout**:
```typescript
<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
  {roasts.map((roast, index) => (
    <Card
      key={index}
      className="shadow-card animate-fade-in hover-scale border-2 hover:border-primary/30 transition-all duration-300 h-fit"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              ⚡ The Review
            </div>
            <div className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
              Original
            </div>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            {roast.category}
          </span>
        </div>
        <div className="mb-3">
          <p className="text-sm font-medium text-muted-foreground mb-2">Original Resume Line:</p>
          <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border break-words">
            {roast.original}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary rounded-lg p-4 mb-4">
          <div className="flex gap-2">
            <Flame className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed font-medium break-words">{roast.roast}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Reactions:</span>
          <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
            <Flame className="w-4 h-4" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
            <Smile className="w-4 h-4" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
            <Brain className="w-4 h-4" />
            <span>0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 4. **Navigation System** (`src/components/Navbar.tsx`)

**Implementation**:
```typescript
import { FileText, Star } from "lucide-react";

interface NavbarProps {
  totalRoasts: number;
}

export const Navbar = ({ totalRoasts }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ResumeReviewer</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  AI-powered resume analysis and improvement
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>{totalRoasts} Reviews</span>
            </div>
            
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300">
              Get Started - Free! ⭐
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

### 5. **Sample Data System** (`src/components/RoastSamples.tsx`)

**Hardcoded Sample Data**:
```typescript
const sampleRoasts: Roast[] = [
  {
    id: "1",
    original_text: "Experienced professional with strong communication skills and ability to work in a team environment.",
    roast_feedback: "This is the most generic sentence in resume history. It's like saying 'I can breathe and sometimes I talk to people.' Every recruiter's eyes glaze over at this point. Be specific! What did you actually accomplish? How did you improve team communication? Give us numbers, results, impact!",
    fire_count: 42,
    laugh_count: 18,
    thinking_count: 7
  },
  {
    id: "2", 
    original_text: "Responsible for various tasks and duties as assigned by management.",
    roast_feedback: "This is literally saying 'I do whatever my boss tells me to do.' It's not a job description, it's a surrender. What were you actually responsible for? What value did you bring? This screams 'I have no idea what I actually did here.' Be specific about your impact!",
    fire_count: 38,
    laugh_count: 25,
    thinking_count: 12
  },
  {
    id: "3",
    original_text: "Proficient in Microsoft Office Suite including Word, Excel, and PowerPoint.",
    roast_feedback: "Congratulations, you can use software that 99% of the population uses daily. This is like saying 'I can use a calculator' in 2024. What did you actually DO with these tools? Did you create complex spreadsheets that saved the company $50K? Did you design presentations that won major clients? Show impact, not just basic computer literacy!",
    fire_count: 29,
    laugh_count: 31,
    thinking_count: 15
  }
];
```

---

## 🗄️ Database Schema & Operations

### **Supabase Database Structure**

```sql
-- Main roasts table
CREATE TABLE roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_text TEXT NOT NULL,
  roast_feedback TEXT NOT NULL,
  roast_type VARCHAR(50),
  fire_count INTEGER DEFAULT 0,
  laugh_count INTEGER DEFAULT 0,
  thinking_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_roasts_created_at ON roasts(created_at);
CREATE INDEX idx_roasts_type ON roasts(roast_type);
```

### **Database Operations**

**Inserting New Roasts**:
```typescript
const { data, error } = await supabase.from('roasts').insert({
  original_text: roast.original,
  roast_feedback: roast.roast,
  roast_type: roast.category
});
```

**Fetching Sample Data**:
```typescript
const { data, error } = await supabase.rpc('get_sample_roasts', { sample_size: 3 });
```

**Counting Total Roasts**:
```typescript
const { count, error } = await supabase
  .from('roasts')
  .select('*', { count: 'exact', head: true });
```

---

## 🔧 Environment Configuration

### **Environment Variables**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key
```

### **Supabase Edge Function Environment**
```typescript
// In supabase/functions/roast-resume/index.ts
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
```

---

## 🎨 UI/UX Implementation Details

### **Tailwind CSS Configuration**
```typescript
// tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "hover-scale": "hoverScale 0.2s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **Custom CSS Animations**
```css
/* src/index.css */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes hoverScale {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.hover-scale:hover {
  animation: hoverScale 0.2s ease-in-out;
}
```

---

## 🚀 Deployment & Build Process

### **Vite Configuration**
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### **Build Commands**
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

---

## 🔒 Security Implementation

### **Authentication Flow**
```typescript
// Google OAuth with Supabase
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/roast`,
    },
  });
  if (error) throw error;
};
```

### **API Security**
```typescript
// Rate limiting in Edge Function
const rateLimitKey = `rate_limit_${clientIP}`;
const rateLimitCount = await redis.get(rateLimitKey);

if (rateLimitCount && parseInt(rateLimitCount) > 10) {
  throw new Error('Rate limit exceeded');
}

await redis.setex(rateLimitKey, 3600, (parseInt(rateLimitCount) || 0) + 1);
```

### **Input Validation**
```typescript
// File type validation
const allowedTypes = ['application/pdf', 'text/plain', 'application/msword'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// File size validation
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

---

## 📊 Performance Optimizations

### **Code Splitting**
```typescript
// Lazy loading components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### **Image Optimization**
```typescript
// Lazy loading images
const LazyImage = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
```

### **Bundle Optimization**
```typescript
// Tree shaking imports
import { Flame, FileText } from "lucide-react"; // Only import what you need

// Dynamic imports for large libraries
const pdfjsLib = await import('pdfjs-dist');
```

---

## 🧪 Testing Strategy

### **Unit Testing Example**
```typescript
// UploadZone.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadZone } from './UploadZone';

describe('UploadZone', () => {
  test('handles file upload', async () => {
    const mockOnFileSelect = jest.fn();
    render(<UploadZone onFileSelect={mockOnFileSelect} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).toHaveBeenCalled();
  });
});
```

### **Integration Testing**
```typescript
// API integration test
describe('Roast API', () => {
  test('processes resume text', async () => {
    const response = await fetch('/api/roast', {
      method: 'POST',
      body: JSON.stringify({ resumeText: 'test resume' })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.roasts).toBeDefined();
  });
});
```

---

## 🔄 State Management Patterns

### **Local State with Hooks**
```typescript
// Component state management
const [resumeText, setResumeText] = useState("");
const [roasts, setRoasts] = useState<RoastResult[]>([]);
const [isRoasting, setIsRoasting] = useState(false);

// Custom hook for file processing
const useFileProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await extractTextFromPDF(file);
      return text;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { processFile, isProcessing };
};
```

### **Global State with Context**
```typescript
// Auth context
const AuthContext = createContext<{
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) throw error;
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🎯 Common Interview Questions & Answers

### **Technical Architecture Questions**

**Q: How does the file upload system work?**
A: The system uses react-dropzone for drag-and-drop functionality, validates file types and sizes, then uses PDF.js for client-side text extraction. The extracted text is passed to the AI analysis pipeline via Supabase Edge Functions.

**Q: Why did you choose Supabase over other backend solutions?**
A: Supabase provides a complete backend solution with PostgreSQL database, real-time subscriptions, authentication, and edge functions. It's cost-effective, has excellent developer experience, and integrates seamlessly with React applications.

**Q: How do you handle errors in the AI processing pipeline?**
A: We implement comprehensive error handling with try-catch blocks, provide user-friendly error messages via toast notifications, and have fallback mechanisms for API failures. We also implement rate limiting and retry logic.

### **React & TypeScript Questions**

**Q: How do you manage component state in this application?**
A: We use React hooks (useState, useEffect) for local component state, React Query for server state management, and Context API for global authentication state. Each component manages its own state with clear separation of concerns.

**Q: How do you handle TypeScript in this project?**
A: We use strict TypeScript configuration with proper interfaces for all data structures, generic types for reusable components, and type-safe API calls. All components are fully typed with proper prop interfaces.

**Q: How do you implement responsive design?**
A: We use Tailwind CSS with responsive breakpoints (md:, lg:, xl:, 2xl:) and CSS Grid for layout. The card system adapts from 1 column on mobile to 4 columns on large screens.

### **Performance & Optimization Questions**

**Q: How do you optimize bundle size?**
A: We use Vite for fast builds, implement code splitting with React.lazy(), tree-shake unused imports, and optimize images. We also use dynamic imports for large libraries like PDF.js.

**Q: How do you handle large PDF files?**
A: We implement client-side processing with PDF.js, add file size validation (10MB limit), and provide progress indicators. For very large files, we could implement chunked processing or server-side processing.

**Q: How do you implement caching?**
A: We use React Query for client-side caching of API responses, implement browser caching for static assets, and could add Redis caching for frequently accessed data.

### **Security Questions**

**Q: How do you prevent XSS attacks?**
A: We sanitize all user inputs, use React's built-in XSS protection, implement Content Security Policy headers, and validate all file uploads before processing.

**Q: How do you handle authentication securely?**
A: We use Supabase Auth with Google OAuth, implement JWT token management, use secure HTTP-only cookies, and implement proper session management.

**Q: How do you protect against API abuse?**
A: We implement rate limiting, validate all inputs, use API keys securely, and implement request throttling. We also monitor for suspicious activity patterns.

---

## 🚀 Advanced Features & Extensions

### **Real-time Collaboration**
```typescript
// Supabase real-time subscriptions
useEffect(() => {
  const subscription = supabase
    .channel('roasts')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'roasts' },
      (payload) => {
        setRoasts(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### **Progressive Web App Features**
```typescript
// Service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed'));
}

// Offline functionality
const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

### **Analytics Integration**
```typescript
// Google Analytics integration
const trackEvent = (eventName: string, parameters?: object) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};

// Usage
trackEvent('resume_uploaded', { file_type: 'pdf', file_size: file.size });
trackEvent('roast_completed', { roast_count: roasts.length });
```

---

## 📈 Monitoring & Debugging

### **Error Tracking**
```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### **Performance Monitoring**
```typescript
// Performance metrics
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Usage
measurePerformance('PDF Processing', () => {
  extractTextFromPDF(file);
});
```

---

## 🎓 Learning Outcomes & Skills Demonstrated

### **Frontend Skills**
- Modern React with hooks and functional components
- TypeScript for type safety and better development experience
- Tailwind CSS for responsive design and styling
- Component composition and reusability
- State management with hooks and context

### **Backend Skills**
- Supabase for database and authentication
- Edge functions for serverless processing
- API design and integration
- Error handling and validation
- Security best practices

### **AI Integration**
- OpenAI API integration
- Prompt engineering for consistent results
- Response parsing and validation
- Rate limiting and error handling

### **DevOps & Deployment**
- Vite for fast development and building
- Environment variable management
- Production optimization
- Performance monitoring

---

## 🔧 Troubleshooting Common Issues

### **PDF Processing Issues**
```typescript
// Debug PDF processing
const debugPDFProcessing = async (file: File) => {
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer size:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      console.log(`Page ${i} text items:`, textContent.items.length);
    }
  } catch (error) {
    console.error('PDF processing error:', error);
  }
};
```

### **API Error Handling**
```typescript
// Comprehensive error handling
const handleAPIError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.message?.includes('Rate limit')) {
    return 'Too many requests. Please try again later.';
  } else if (error.message?.includes('Payment required')) {
    return 'API quota exceeded. Please check your OpenAI account.';
  } else if (error.message?.includes('Invalid API key')) {
    return 'API key is invalid. Please check your configuration.';
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};
```

---

This comprehensive guide covers every aspect of the ResumeReviewer project, from technical implementation to interview preparation. You can use this document to understand the project deeply, prepare for technical interviews, or share with GPT for detailed analysis and preparation.
