import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Image as ImageIcon, Plus, Trash2, Save, CheckCircle, Layers, Globe, Loader2, AlertCircle, X } from 'lucide-react';
import {
  DocumentType,
  FormData,
  Template,
  CustomTemplate,
} from '../types/templates';
import PreviewDialog from './PreviewDialog';
import { fileToDataUrl } from '../lib/templateAssets/fileToDataUrl';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface TemplateDesignerProps {
  formData: FormData;
  builtInTemplates: Record<DocumentType, Template>;
  customTemplates: CustomTemplate[];
  isSaving?: boolean;
  saveError?: string | null;
  onClearSaveError?: () => void;
  onUpdateBuiltInTemplate: (docType: DocumentType, updates: Partial<Template>) => void;
  onSaveBuiltInTemplate: (docType: DocumentType) => void;
  onCreateCustomTemplate: (name: string) => void;
  onUpdateCustomTemplate: (id: string, updates: Partial<CustomTemplate>) => void;
  onDeleteCustomTemplate: (id: string) => void;
  onApplyHeaderToAll: (businessName: string, businessAddress: string, logoDataUrl: string | null) => boolean;
  onSaveToBackend: (template: CustomTemplate) => Promise<void>;
}

type ActiveTab = DocumentType | string;

export default function TemplateDesigner({
  formData,
  builtInTemplates,
  customTemplates,
  isSaving,
  saveError,
  onClearSaveError,
  onUpdateBuiltInTemplate,
  onSaveBuiltInTemplate,
  onCreateCustomTemplate,
  onUpdateCustomTemplate,
  onDeleteCustomTemplate,
  onApplyHeaderToAll,
  onSaveToBackend,
}: TemplateDesignerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Loan Approval Letter');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [localSaveError, setLocalSaveError] = useState<string | null>(null);

  const isBuiltIn = activeTab in builtInTemplates;
  const currentTemplate = isBuiltIn
    ? builtInTemplates[activeTab as DocumentType]
    : customTemplates.find((t) => t.id === activeTab);

  if (!currentTemplate) return null;

  const displayError = localSaveError || saveError || null;

  const handleClearError = () => {
    setLocalSaveError(null);
    setSaveState('idle');
    onClearSaveError?.();
  };

  const handleTemplateChange = (updates: Partial<Template>) => {
    if (displayError) handleClearError();
    if (isBuiltIn) {
      onUpdateBuiltInTemplate(activeTab as DocumentType, updates);
    } else {
      onUpdateCustomTemplate(activeTab, updates);
    }
  };

  const handleSaveTemplate = async () => {
    setSaveState('saving');
    setLocalSaveError(null);
    onClearSaveError?.();
    try {
      if (isBuiltIn) {
        onSaveBuiltInTemplate(activeTab as DocumentType);
        const templateToSave: CustomTemplate = {
          ...currentTemplate,
          id: currentTemplate.id ?? activeTab,
          name: currentTemplate.name ?? activeTab,
        };
        await onSaveToBackend(templateToSave);
      } else {
        const customT = currentTemplate as CustomTemplate;
        await onSaveToBackend(customT);
      }
      setSaveState('saved');
      toast.success('Template saved and shared!', {
        description: isBuiltIn
          ? `"${activeTab}" has been saved and shared with all users.`
          : `"${(currentTemplate as CustomTemplate).name}" has been saved and shared with all users.`,
      });
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save template. Please try again.';
      setSaveState('error');
      setLocalSaveError(message);
      if (isBuiltIn) {
        onSaveBuiltInTemplate(activeTab as DocumentType);
      }
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      handleTemplateChange({
        background: { ...currentTemplate.background!, dataUrl },
      });
    } catch (error) {
      console.error('Failed to upload background:', error);
    }
  };

  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      handleTemplateChange({
        seal: { ...currentTemplate.seal!, dataUrl },
      });
    } catch (error) {
      console.error('Failed to upload seal:', error);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      handleTemplateChange({
        signature: { ...currentTemplate.signature!, dataUrl },
      });
    } catch (error) {
      console.error('Failed to upload signature:', error);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentTemplate.body;
    const before = text.substring(0, start);
    const after = text.substring(end);
    handleTemplateChange({ body: before + placeholder + after });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const handleCreateCustomTemplate = () => {
    if (!newTemplateName.trim()) return;
    onCreateCustomTemplate(newTemplateName.trim());
    setNewTemplateName('');
    setShowNewTemplateDialog(false);
  };

  const handleDeleteCustomTemplate = () => {
    if (deleteConfirmId) {
      onDeleteCustomTemplate(deleteConfirmId);
      setDeleteConfirmId(null);
      setActiveTab('Loan Approval Letter');
    }
  };

  const placeholders = [
    { label: 'Name', value: '{{name}}' },
    { label: 'Loan Amount', value: '{{loanAmount}}' },
    { label: 'Interest Rate', value: '{{interestRate}}' },
    { label: 'Year', value: '{{year}}' },
    { label: 'Monthly EMI', value: '{{monthlyEmi}}' },
    { label: 'Processing Charge', value: '{{processingCharge}}' },
    { label: 'Bank Account No.', value: '{{bankAccountNumber}}' },
    { label: 'IFSC Code', value: '{{ifscCode}}' },
    { label: 'UPI ID', value: '{{upiId}}' },
    ...formData.customFields.map((field) => ({
      label: field.label,
      value: `{{custom:${field.label}}}`,
    })),
  ];

  const builtInTabs: DocumentType[] = ['Loan Approval Letter', 'Loan GST Letter', 'Loan Section Letter'];

  const isBusy = saveState === 'saving' || isSaving;
  const isErrorState = saveState === 'error';

  const activeTabLabel = isBuiltIn
    ? activeTab
    : (currentTemplate as CustomTemplate).name ?? activeTab;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                Advanced Template Designer
                <Badge variant="secondary" className="text-xs gap-1">
                  <Globe className="h-3 w-3" />
                  Shared Globally
                </Badge>
              </CardTitle>
              <CardDescription>
                Customize templates with watermark, seal, signature, and background. Header and footer are fixed to Bajaj Finserv branding.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                className="gap-1"
              >
                <ImageIcon className="h-4 w-4" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTemplate}
                disabled={isBusy}
                variant={isErrorState ? 'destructive' : 'default'}
                className="gap-1"
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isErrorState ? (
                  <AlertCircle className="h-4 w-4" />
                ) : saveState === 'saved' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isBusy ? 'Saving…' : isErrorState ? 'Retry Save' : saveState === 'saved' ? 'Saved!' : 'Save & Share'}
              </Button>
            </div>
          </div>

          {displayError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>Failed to save template</span>
                <button
                  onClick={handleClearError}
                  className="ml-auto -mr-1 rounded p-0.5 hover:bg-destructive/20 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertTitle>
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          {/* Template Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {builtInTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab}
              </button>
            ))}
            {customTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Layers className="h-3 w-3" />
                {t.name}
              </button>
            ))}
            <button
              onClick={() => setShowNewTemplateDialog(true)}
              className="px-3 py-1.5 rounded-md text-sm font-medium border border-dashed border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              New Template
            </button>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <Accordion type="multiple" defaultValue={['content', 'watermark']} className="w-full">

              {/* ── Content ── */}
              <AccordionItem value="content">
                <AccordionTrigger>Document Content</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input
                      value={currentTemplate.headline}
                      onChange={(e) => handleTemplateChange({ headline: e.target.value })}
                      placeholder="Document headline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Placeholder Tags</Label>
                    <div className="flex flex-wrap gap-1">
                      {placeholders.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => insertPlaceholder(p.value)}
                          className="px-2 py-0.5 rounded text-xs bg-muted hover:bg-muted/80 border border-border transition-colors font-mono"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Body Text</Label>
                    <Textarea
                      id="template-body"
                      value={currentTemplate.body}
                      onChange={(e) => handleTemplateChange({ body: e.target.value })}
                      rows={12}
                      className="font-mono text-xs"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Watermark ── */}
              <AccordionItem value="watermark">
                <AccordionTrigger>Watermark</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Enable Watermark</Label>
                    <Switch
                      checked={currentTemplate.watermark?.enabled ?? false}
                      onCheckedChange={(checked) =>
                        handleTemplateChange({
                          watermark: { ...currentTemplate.watermark!, enabled: checked },
                        })
                      }
                    />
                  </div>

                  {currentTemplate.watermark?.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Watermark Text</Label>
                        <Input
                          value={currentTemplate.watermark?.text ?? ''}
                          onChange={(e) =>
                            handleTemplateChange({
                              watermark: { ...currentTemplate.watermark!, text: e.target.value },
                            })
                          }
                          placeholder="e.g. CONFIDENTIAL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Opacity ({Math.round((currentTemplate.watermark?.opacity ?? 0.05) * 100)}%)</Label>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[Math.round((currentTemplate.watermark?.opacity ?? 0.05) * 100)]}
                          onValueChange={([v]) =>
                            handleTemplateChange({
                              watermark: { ...currentTemplate.watermark!, opacity: v / 100 },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentTemplate.watermark?.color ?? '#cccccc'}
                            onChange={(e) =>
                              handleTemplateChange({
                                watermark: { ...currentTemplate.watermark!, color: e.target.value },
                              })
                            }
                            className="h-9 w-14 rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* ── Seal ── */}
              <AccordionItem value="seal">
                <AccordionTrigger>Seal / Stamp</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Enable Seal</Label>
                    <Switch
                      checked={currentTemplate.seal?.enabled ?? false}
                      onCheckedChange={(checked) =>
                        handleTemplateChange({
                          seal: { ...currentTemplate.seal!, enabled: checked },
                        })
                      }
                    />
                  </div>

                  {currentTemplate.seal?.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Upload Seal Image</Label>
                        <div className="flex items-center gap-3">
                          {currentTemplate.seal?.dataUrl && (
                            <img
                              src={currentTemplate.seal.dataUrl}
                              alt="Seal preview"
                              className="h-16 w-16 object-contain rounded border border-border"
                            />
                          )}
                          <div className="flex gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSealUpload}
                              />
                              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors">
                                Upload Seal
                              </span>
                            </label>
                            {currentTemplate.seal?.dataUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTemplateChange({
                                    seal: { ...currentTemplate.seal!, dataUrl: null },
                                  })
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Opacity ({currentTemplate.seal?.opacity ?? 80}%)</Label>
                        <Slider
                          min={10}
                          max={100}
                          step={5}
                          value={[currentTemplate.seal?.opacity ?? 80]}
                          onValueChange={([v]) =>
                            handleTemplateChange({
                              seal: { ...currentTemplate.seal!, opacity: v },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* ── Signature ── */}
              <AccordionItem value="signature">
                <AccordionTrigger>Signature</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Enable Signature</Label>
                    <Switch
                      checked={currentTemplate.signature?.enabled ?? false}
                      onCheckedChange={(checked) =>
                        handleTemplateChange({
                          signature: { ...currentTemplate.signature!, enabled: checked },
                        })
                      }
                    />
                  </div>

                  {currentTemplate.signature?.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Upload Signature Image</Label>
                        <div className="flex items-center gap-3">
                          {currentTemplate.signature?.dataUrl && (
                            <img
                              src={currentTemplate.signature.dataUrl}
                              alt="Signature preview"
                              className="h-12 w-auto object-contain rounded border border-border"
                            />
                          )}
                          <div className="flex gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSignatureUpload}
                              />
                              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors">
                                Upload Signature
                              </span>
                            </label>
                            {currentTemplate.signature?.dataUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTemplateChange({
                                    signature: { ...currentTemplate.signature!, dataUrl: null },
                                  })
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Signatory Name</Label>
                        <Input
                          value={currentTemplate.signature?.signatoryName ?? ''}
                          onChange={(e) =>
                            handleTemplateChange({
                              signature: { ...currentTemplate.signature!, signatoryName: e.target.value },
                            })
                          }
                          placeholder="e.g. John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Signatory Title</Label>
                        <Input
                          value={currentTemplate.signature?.signatoryTitle ?? ''}
                          onChange={(e) =>
                            handleTemplateChange({
                              signature: { ...currentTemplate.signature!, signatoryTitle: e.target.value },
                            })
                          }
                          placeholder="e.g. Authorized Signatory"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Opacity ({currentTemplate.signature?.opacity ?? 100}%)</Label>
                        <Slider
                          min={10}
                          max={100}
                          step={5}
                          value={[currentTemplate.signature?.opacity ?? 100]}
                          onValueChange={([v]) =>
                            handleTemplateChange({
                              signature: { ...currentTemplate.signature!, opacity: v },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* ── Background ── */}
              <AccordionItem value="background">
                <AccordionTrigger>Background Image</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Enable Background</Label>
                    <Switch
                      checked={currentTemplate.background?.enabled ?? false}
                      onCheckedChange={(checked) =>
                        handleTemplateChange({
                          background: { ...currentTemplate.background!, enabled: checked },
                        })
                      }
                    />
                  </div>

                  {currentTemplate.background?.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Upload Background Image</Label>
                        <div className="flex items-center gap-3">
                          {currentTemplate.background?.dataUrl && (
                            <img
                              src={currentTemplate.background.dataUrl}
                              alt="Background preview"
                              className="h-16 w-auto object-contain rounded border border-border"
                            />
                          )}
                          <div className="flex gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBackgroundUpload}
                              />
                              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors">
                                Upload Background
                              </span>
                            </label>
                            {currentTemplate.background?.dataUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTemplateChange({
                                    background: { ...currentTemplate.background!, dataUrl: null },
                                  })
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Opacity ({Math.round((currentTemplate.background?.opacity ?? 0.1) * 100)}%)</Label>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[Math.round((currentTemplate.background?.opacity ?? 0.1) * 100)]}
                          onValueChange={([v]) =>
                            handleTemplateChange({
                              background: { ...currentTemplate.background!, opacity: v / 100 },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* ── Delete custom template ── */}
              {!isBuiltIn && (
                <AccordionItem value="danger">
                  <AccordionTrigger className="text-destructive">Danger Zone</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmId(activeTab)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete This Template
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* New Template Dialog */}
      <AlertDialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Template</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for your new custom template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Template name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomTemplate()}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewTemplateName('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateCustomTemplate}
              disabled={!newTemplateName.trim()}
            >
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        template={currentTemplate}
        formData={formData}
        documentType={activeTabLabel}
      />
    </div>
  );
}
