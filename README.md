
# 🔥 RoastMyResume

An AI-powered resume review platform that provides brutally honest feedback to help you improve your resume. Get roasted by our AI to make your resume stand out!

## 🚀 Features

- **AI-Powered Reviews**: Get honest, detailed feedback on your resume content
- **Multiple File Formats**: Support for PDF, DOCX, and TXT files
- **Real-time Processing**: Fast text extraction and analysis
- **Interactive Examples**: See sample reviews to understand the feedback style
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Edge Functions)
- **AI**: OpenAI GPT-4 for resume analysis
- **File Processing**: PDF.js for PDF text extraction
- **Deployment**: Vercel/Netlify ready

## 📁 Project Structure

```
RoastMyResume/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Hero.tsx         # Landing page hero section
│   │   ├── HowItWorks.tsx   # How it works section
│   │   ├── RoastSamples.tsx # Example reviews showcase
│   │   └── UploadZone.tsx   # File upload component
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Home page
│   │   ├── Roast.tsx        # Main roasting page
│   │   └── NotFound.tsx     # 404 page
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client and types
│   ├── lib/                 # Utility functions
│   └── main.tsx            # App entry point
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge functions
│   │   └── roast-resume/   # AI resume analysis function
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RoastMyResume
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Start local Supabase
   supabase start
   
   # Run migrations
   supabase db reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 How It Works

### 1. File Upload & Processing
- **Upload Interface**: Users drag and drop or click to upload resume files
- **Supported Formats**: PDF, DOCX, TXT files with size validation
- **Text Extraction**: PDF.js library extracts text from PDF files
- **Content Processing**: File content is validated and prepared for analysis
- **State Management**: Resume text is passed between components via React Router

### 2. AI Analysis Pipeline
- **Edge Function**: Supabase Edge Function handles serverless processing
- **OpenAI Integration**: GPT-4 analyzes resume content for common issues
- **Prompt Engineering**: Structured prompts ensure consistent, actionable feedback
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Graceful fallbacks for API failures

### 3. Results Display System
- **Card Layout**: Responsive grid system with 1-4 columns based on screen size
- **Content Organization**: Original text vs. AI feedback in structured cards
- **Interactive Elements**: Reaction system for user engagement
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Animation**: Smooth transitions and loading states

### 4. Database Architecture
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **Data Models**: Roasts table with original text, feedback, and metadata
- **Sample Data**: Pre-populated examples for demonstration
- **Analytics**: Reaction tracking and usage statistics
- **Migrations**: Version-controlled database schema changes



## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 🛠️ Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Environment Setup
1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Database Setup**: Run migrations to create required tables
3. **Edge Functions**: Deploy the roast-resume function
4. **Environment Variables**: Set up all required API keys

### Common Issues & Solutions

#### PDF Processing Issues
- **Problem**: PDF text extraction fails
- **Solution**: Ensure PDF.js worker is properly configured
- **Check**: Verify `/public/pdf.worker.min.js` exists

#### OpenAI API Errors
- **Problem**: Rate limiting or API key issues
- **Solution**: Check API key validity and usage limits
- **Debug**: Check browser console for detailed error messages

#### Supabase Connection Issues
- **Problem**: Database connection failures
- **Solution**: Verify environment variables and project settings
- **Check**: Ensure RLS policies are properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
   
<img width="1210" height="928" alt="Screenshot 2025-10-17 at 11 46 57 PM" src="https://github.com/user-attachments/assets/2e8aa035-fc82-4b44-a5e9-d757ad14566e" />



### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Add proper error handling
- Write clear component documentation


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- UI components from shadcn/ui
- Powered by Supabase and OpenAI
- Styled with Tailwind CSS
