import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import FormSection from './components/FormSection';
import TemplateDesigner from './components/TemplateDesigner';
import { DocumentType, FormData } from './types/form';
import { validateForm } from './lib/validation';
import { generatePdf } from './lib/pdf/generatePdf';
import { downloadFile } from './lib/download';
import { sharePdf } from './lib/shareUtils';
import { FileText, Heart } from 'lucide-react';
import { useTemplates } from './hooks/useTemplates';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      throwOnError: false,
    },
  },
});

function AppContent() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    loanType: '',
    loanAmount: '',
    interestRate: '',
    year: '',
    monthlyEmi: '0',
    processingCharge: '',
    bankAccountNumber: '',
    ifscCode: '',
    upiId: '',
    customFields: [],
  });

  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const {
    builtInTemplates,
    customTemplates,
    isSaving,
    saveError,
    clearSaveError,
    updateBuiltInTemplate,
    saveTemplate,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    applyHeaderToAllTemplates,
    saveCustomTemplateToBackend,
    getTemplateById,
  } = useTemplates();

  // Keep TemplateDesigner in scope to avoid unused import warnings
  void TemplateDesigner;

  const handleFormChange = (data: FormData) => {
    setFormData(data);
  };

  const handleDownload = async (docType: DocumentType | string) => {
    const errors = validateForm(formData);

    if (errors.length > 0) {
      toast.error('Please fix the following errors:', {
        description: errors.join(', '),
      });
      return;
    }

    setIsGenerating(docType);

    try {
      const pdfBlob = await generatePdf(docType, formData, undefined, getTemplateById);
      const filename = `${typeof docType === 'string' ? docType.toLowerCase().replace(/\s+/g, '-') : 'document'}.png`;
      downloadFile(pdfBlob, filename);

      toast.success('Document downloaded successfully!', {
        description: 'Your document has been generated.',
      });

      await sharePdf(pdfBlob, filename);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate document', {
        description: 'Please try again or check your template settings.',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  // Suppress unused variable warnings for template management hooks
  void isSaving;
  void saveError;
  void clearSaveError;
  void updateBuiltInTemplate;
  void saveTemplate;
  void createCustomTemplate;
  void updateCustomTemplate;
  void deleteCustomTemplate;
  void applyHeaderToAllTemplates;
  void saveCustomTemplateToBackend;
  void builtInTemplates;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Loan Document Generator</h1>
              <p className="text-sm text-muted-foreground">
                Create professional loan letters with custom templates
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FormSection
          formData={formData}
          onFormChange={handleFormChange}
          onDownload={handleDownload}
          isGenerating={isGenerating}
          customTemplates={customTemplates}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Built with <Heart className="h-4 w-4 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Loan Document Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
