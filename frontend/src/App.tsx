import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import FormSection from './components/FormSection';
import TemplateDesigner from './components/TemplateDesigner';
import { DocumentType, FormData } from './types/form';
import { validateForm } from './lib/validation';
import { generatePdf } from './lib/pdf/generatePdf';
import { downloadFile } from './lib/download';
import { sharePdf } from './lib/shareUtils';
import { FileText, Settings2, Heart } from 'lucide-react';
import { useTemplates } from './hooks/useTemplates';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    address: '',
    panNumber: '',
    loanAmount: '',
    interestRate: '',
    year: '',
    monthlyEmi: '0',
    customFields: [],
  });

  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [templateDesignerOpen, setTemplateDesignerOpen] = useState(false);

  const {
    builtInTemplates,
    customTemplates,
    updateBuiltInTemplate,
    saveTemplate,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    applyHeaderToAllTemplates,
  } = useTemplates();

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
      const pdfBlob = await generatePdf(docType, formData);
      const filename = `${typeof docType === 'string' ? docType.toLowerCase().replace(/\s+/g, '-') : 'document'}.pdf`;
      downloadFile(pdfBlob, filename);

      toast.success('Document downloaded successfully!', {
        description: `Your document has been generated.`,
      });

      // After download, attempt to share via Web Share API
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

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Loan Document Generator</h1>
                <p className="text-sm text-muted-foreground">Create professional loan letters with custom templates</p>
              </div>
            </div>

            {/* Advanced Template Designer Button */}
            <Button
              variant="outline"
              onClick={() => setTemplateDesignerOpen(true)}
              className="flex items-center gap-2 shrink-0"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Template Designer</span>
              <span className="sm:hidden">Templates</span>
            </Button>
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

      {/* Advanced Template Designer Modal */}
      <Dialog open={templateDesignerOpen} onOpenChange={setTemplateDesignerOpen}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Advanced Template Designer
            </DialogTitle>
            <DialogDescription>
              Customize templates with logo, background, watermark, seal, and signature.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <TemplateDesigner
              formData={formData}
              builtInTemplates={builtInTemplates}
              customTemplates={customTemplates}
              onUpdateBuiltInTemplate={updateBuiltInTemplate}
              onSaveBuiltInTemplate={saveTemplate}
              onCreateCustomTemplate={createCustomTemplate}
              onUpdateCustomTemplate={updateCustomTemplate}
              onDeleteCustomTemplate={deleteCustomTemplate}
              onApplyHeaderToAll={applyHeaderToAllTemplates}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1 flex-wrap">
            © {new Date().getFullYear()} Built with{' '}
            <Heart className="h-3.5 w-3.5 text-primary fill-primary" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'loan-document-generator'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
