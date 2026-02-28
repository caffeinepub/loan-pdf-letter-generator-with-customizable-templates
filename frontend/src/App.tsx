import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useTemplates } from './hooks/useTemplates';
import FormSection from './components/FormSection';
import PreviewDialog from './components/PreviewDialog';
import TemplateDesigner from './components/TemplateDesigner';
import ProfileSetupModal from './components/ProfileSetupModal';
import { FormData, DEFAULT_FORM_DATA } from './types/form';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, FileText, Heart } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppContent() {
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } =
    useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const {
    builtInTemplates,
    customTemplates,
    allTemplates,
    getTemplateByDocType,
    getTemplateById,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  } = useTemplates();

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [designerOpen, setDesignerOpen] = useState(false);

  const selectedTemplate =
    getTemplateByDocType(formData.documentType) ||
    getTemplateById(formData.documentType) ||
    builtInTemplates[0];

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const handleGenerate = () => {
    setPreviewOpen(true);
  };

  const year = new Date().getFullYear();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-app';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/bajaj-finserv-logo.dim_400x200.png"
              alt="Bajaj Finserv"
              className="h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block">
              <h1 className="font-serif text-lg font-bold text-foreground leading-tight">
                Loan Document Generator
              </h1>
              <p className="text-xs text-muted-foreground">Professional document creation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isInitializing ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-9">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userProfile?.name
                          ? userProfile.name.charAt(0).toUpperCase()
                          : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {userProfile?.name || 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userProfile && (
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                      {userProfile.email || identity.getPrincipal().toString().slice(0, 12) + '...'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="sm"
                className="gap-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Generate Loan Document
          </h2>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to generate a professional loan sanction letter.
          </p>
        </div>

        <FormSection
          formData={formData}
          onChange={setFormData}
          onGenerate={handleGenerate}
          selectedTemplate={selectedTemplate}
          customTemplates={customTemplates}
          onOpenTemplateDesigner={() => setDesignerOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Bajaj Finserv Loan Document Generator</span>
            </div>
            <div className="flex items-center gap-1">
              <span>© {year} Built with</span>
              <Heart className="h-3 w-3 text-primary fill-primary mx-1" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium ml-1"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      {selectedTemplate && (
        <PreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          template={selectedTemplate}
          formData={formData}
        />
      )}

      <TemplateDesigner
        open={designerOpen}
        onClose={() => setDesignerOpen(false)}
        customTemplates={customTemplates}
        onAddCustomTemplate={addCustomTemplate}
        onUpdateCustomTemplate={updateCustomTemplate}
        onDeleteCustomTemplate={deleteCustomTemplate}
        selectedDocType={formData.documentType}
        onSelectDocType={(docType) => {
          setFormData((prev) => ({ ...prev, documentType: docType }));
          setDesignerOpen(false);
        }}
      />

      {showProfileSetup && <ProfileSetupModal open={showProfileSetup} />}

      <Toaster />
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
