import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon, Plus, Trash2, Save } from 'lucide-react';
import { DocumentType, FormData, Template, CustomTemplate, PositionPreset } from '../types/templates';
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
  onUpdateBuiltInTemplate: (docType: DocumentType, updates: Partial<Template>) => void;
  onCreateCustomTemplate: (name: string) => void;
  onUpdateCustomTemplate: (id: string, updates: Partial<CustomTemplate>) => void;
  onDeleteCustomTemplate: (id: string) => void;
}

type ActiveTab = DocumentType | string;

export default function TemplateDesigner({
  formData,
  builtInTemplates,
  customTemplates,
  onUpdateBuiltInTemplate,
  onCreateCustomTemplate,
  onUpdateCustomTemplate,
  onDeleteCustomTemplate,
}: TemplateDesignerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Loan Approval Letter');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isBuiltIn = activeTab in builtInTemplates;
  const currentTemplate = isBuiltIn
    ? builtInTemplates[activeTab as DocumentType]
    : customTemplates.find((t) => t.id === activeTab);

  if (!currentTemplate) return null;

  const handleTemplateChange = (updates: Partial<Template>) => {
    if (isBuiltIn) {
      onUpdateBuiltInTemplate(activeTab as DocumentType, updates);
    } else {
      onUpdateCustomTemplate(activeTab, updates);
    }
  };

  const handleSaveTemplate = () => {
    setIsSaving(true);
    try {
      if (isBuiltIn) {
        const name = `${activeTab} (Custom)`;
        onCreateCustomTemplate(name);
        toast.success('Template saved as custom template!', {
          description: `"${name}" has been added to your custom templates.`,
        });
      } else {
        toast.success('Template saved!', {
          description: `"${(currentTemplate as CustomTemplate).name}" has been saved.`,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      handleTemplateChange({ logoDataUrl: dataUrl });
    } catch (error) {
      console.error('Failed to upload logo:', error);
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

    handleTemplateChange({
      body: before + placeholder + after,
    });

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
    { label: 'Mobile', value: '{{mobile}}' },
    { label: 'Address', value: '{{address}}' },
    { label: 'PAN Number', value: '{{panNumber}}' },
    { label: 'Loan Amount', value: '{{loanAmount}}' },
    { label: 'Interest Rate', value: '{{interestRate}}' },
    { label: 'Year', value: '{{year}}' },
    { label: 'Monthly EMI', value: '{{monthlyEmi}}' },
    ...formData.customFields.map((field) => ({
      label: field.label,
      value: `{{custom:${field.label}}}`,
    })),
  ];

  const builtInTabs: DocumentType[] = ['Loan Approval Letter', 'Loan GST Letter', 'Loan Section Letter'];

  // Inline preview of signature/seal two-column layout
  const hasSignature = !!(currentTemplate.signature?.dataUrl);
  const hasSeal = !!(currentTemplate.seal?.dataUrl);
  const showSignatureRow = hasSignature || hasSeal;

  // Inline preview of header
  const hasBusinessName = !!(currentTemplate.businessName?.trim());
  const hasBusinessAddress = !!(currentTemplate.businessAddress?.trim());
  const hasLogo = !!currentTemplate.logoDataUrl;
  const showHeader = hasBusinessName || hasBusinessAddress || hasLogo;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Advanced Template Designer</CardTitle>
              <CardDescription>Customize templates with background, watermark, seal, and signature</CardDescription>
            </div>
            <Button onClick={() => setShowNewTemplateDialog(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max">
                {builtInTabs.map((docType) => (
                  <TabsTrigger key={docType} value={docType}>
                    {docType}
                  </TabsTrigger>
                ))}
                {customTemplates.map((template) => (
                  <TabsTrigger key={template.id} value={template.id}>
                    {template.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            <TabsContent value={activeTab} className="space-y-4 pt-4">
              {/* Custom Template Actions */}
              {!isBuiltIn && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                  <Input
                    placeholder="Template Name"
                    value={(currentTemplate as CustomTemplate).name}
                    onChange={(e) =>
                      onUpdateCustomTemplate(activeTab, { name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteConfirmId(activeTab)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Two-column layout: Settings on left, Preview on right */}
              <div className="flex gap-6">
                {/* Left side: Save button + Settings */}
                <div className="flex flex-col gap-3 w-80 shrink-0">
                  {/* Save Template Button */}
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isSaving}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving…' : isBuiltIn ? 'Save as Custom Template' : 'Save Template'}
                  </Button>

                  {/* Settings Accordion */}
                  <Accordion type="multiple" defaultValue={['basic', 'content']} className="w-full">
                    {/* Basic Settings */}
                    <AccordionItem value="basic">
                      <AccordionTrigger>Basic Settings</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                          <Label>Company Logo</Label>
                          <div className="flex items-center gap-3">
                            {currentTemplate.logoDataUrl ? (
                              <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                                <img
                                  src={currentTemplate.logoDataUrl}
                                  alt="Logo"
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <Input
                                id={`logo-upload-${activeTab}`}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`logo-upload-${activeTab}`)?.click()}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                {currentTemplate.logoDataUrl ? 'Change Logo' : 'Upload Logo'}
                              </Button>
                              {currentTemplate.logoDataUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTemplateChange({ logoDataUrl: null })}
                                  className="ml-2"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Business Name */}
                        <div className="space-y-2">
                          <Label htmlFor="business-name">Business Name</Label>
                          <Input
                            id="business-name"
                            placeholder="e.g. Acme Finance Ltd."
                            value={currentTemplate.businessName || ''}
                            onChange={(e) => handleTemplateChange({ businessName: e.target.value })}
                          />
                        </div>

                        {/* Business Address */}
                        <div className="space-y-2">
                          <Label htmlFor="business-address">Business Address</Label>
                          <Textarea
                            id="business-address"
                            placeholder="e.g. 123 Main Street, City, State - 000000"
                            rows={2}
                            value={currentTemplate.businessAddress || ''}
                            onChange={(e) => handleTemplateChange({ businessAddress: e.target.value })}
                          />
                        </div>

                        {/* Footer */}
                        <div className="space-y-2">
                          <Label htmlFor="footer">Footer Text</Label>
                          <Textarea
                            id="footer"
                            placeholder="This is a computer-generated document..."
                            rows={2}
                            value={currentTemplate.footerText || ''}
                            onChange={(e) => handleTemplateChange({ footerText: e.target.value })}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Background */}
                    <AccordionItem value="background">
                      <AccordionTrigger>Background Image</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                          {currentTemplate.background?.dataUrl ? (
                            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                              <img
                                src={currentTemplate.background.dataUrl}
                                alt="Background"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-border">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              id={`bg-upload-${activeTab}`}
                              type="file"
                              accept="image/*"
                              onChange={handleBackgroundUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`bg-upload-${activeTab}`)?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {currentTemplate.background?.dataUrl ? 'Change' : 'Upload'}
                            </Button>
                            {currentTemplate.background?.dataUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTemplateChange({
                                    background: { ...currentTemplate.background!, dataUrl: null },
                                  })
                                }
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {currentTemplate.background && (
                          <>
                            <div className="space-y-2">
                              <Label>Opacity: {Math.round(currentTemplate.background.opacity * 100)}%</Label>
                              <Slider
                                min={5}
                                max={100}
                                step={5}
                                value={[Math.round(currentTemplate.background.opacity * 100)]}
                                onValueChange={([value]) =>
                                  handleTemplateChange({
                                    background: { ...currentTemplate.background!, opacity: value / 100 },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Fit</Label>
                              <Select
                                value={currentTemplate.background.fit}
                                onValueChange={(value) =>
                                  handleTemplateChange({
                                    background: {
                                      ...currentTemplate.background!,
                                      fit: value as 'cover' | 'contain' | 'fill',
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cover">Cover</SelectItem>
                                  <SelectItem value="contain">Contain</SelectItem>
                                  <SelectItem value="fill">Fill</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Watermark */}
                    <AccordionItem value="watermark">
                      <AccordionTrigger>Watermark</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="watermark-text">Watermark Text</Label>
                          <Input
                            id="watermark-text"
                            placeholder="e.g. CONFIDENTIAL"
                            value={currentTemplate.watermark?.text || currentTemplate.watermarkText || ''}
                            onChange={(e) =>
                              handleTemplateChange({
                                watermark: {
                                  ...currentTemplate.watermark!,
                                  text: e.target.value,
                                },
                                watermarkText: e.target.value,
                              })
                            }
                          />
                        </div>

                        {currentTemplate.watermark && (
                          <>
                            <div className="space-y-2">
                              <Label>Opacity: {Math.round(currentTemplate.watermark.opacity * 100)}%</Label>
                              <Slider
                                min={1}
                                max={30}
                                step={1}
                                value={[Math.round(currentTemplate.watermark.opacity * 100)]}
                                onValueChange={([value]) =>
                                  handleTemplateChange({
                                    watermark: { ...currentTemplate.watermark!, opacity: value / 100 },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Size: {currentTemplate.watermark.size}px</Label>
                              <Slider
                                min={24}
                                max={120}
                                step={4}
                                value={[currentTemplate.watermark.size]}
                                onValueChange={([value]) =>
                                  handleTemplateChange({
                                    watermark: { ...currentTemplate.watermark!, size: value },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Rotation: {currentTemplate.watermark.rotation}°</Label>
                              <Slider
                                min={-90}
                                max={90}
                                step={5}
                                value={[currentTemplate.watermark.rotation]}
                                onValueChange={([value]) =>
                                  handleTemplateChange({
                                    watermark: { ...currentTemplate.watermark!, rotation: value },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Position</Label>
                              <Select
                                value={currentTemplate.watermark.position}
                                onValueChange={(value) =>
                                  handleTemplateChange({
                                    watermark: {
                                      ...currentTemplate.watermark!,
                                      position: value as PositionPreset,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="top-left">Top Left</SelectItem>
                                  <SelectItem value="top-right">Top Right</SelectItem>
                                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Seal */}
                    <AccordionItem value="seal">
                      <AccordionTrigger>Seal / Stamp</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                          {currentTemplate.seal?.dataUrl ? (
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                              <img
                                src={currentTemplate.seal.dataUrl}
                                alt="Seal"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              id={`seal-upload-${activeTab}`}
                              type="file"
                              accept="image/*"
                              onChange={handleSealUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`seal-upload-${activeTab}`)?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {currentTemplate.seal?.dataUrl ? 'Change Seal' : 'Upload Seal'}
                            </Button>
                            {currentTemplate.seal?.dataUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTemplateChange({
                                    seal: { ...currentTemplate.seal!, dataUrl: null },
                                  })
                                }
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {currentTemplate.seal && (
                          <>
                            <div className="space-y-2">
                              <Label>Size: {currentTemplate.seal.size}px</Label>
                              <Slider
                                min={40}
                                max={200}
                                step={10}
                                value={[currentTemplate.seal.size]}
                                onValueChange={([value]) =>
                                  handleTemplateChange({
                                    seal: { ...currentTemplate.seal!, size: value },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Position</Label>
                              <Select
                                value={currentTemplate.seal.position}
                                onValueChange={(value) =>
                                  handleTemplateChange({
                                    seal: {
                                      ...currentTemplate.seal!,
                                      position: value as PositionPreset,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                  <SelectItem value="top-left">Top Left</SelectItem>
                                  <SelectItem value="top-right">Top Right</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Signature */}
                    <AccordionItem value="signature">
                      <AccordionTrigger>Signature</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                          {currentTemplate.signature?.dataUrl ? (
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                              <img
                                src={currentTemplate.signature.dataUrl}
                                alt="Signature"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              id={`sig-upload-${activeTab}`}
                              type="file"
                              accept="image/*"
                              onChange={handleSignatureUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`sig-upload-${activeTab}`)?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {currentTemplate.signature?.dataUrl ? 'Change Signature' : 'Upload Signature'}
                            </Button>
                            {currentTemplate.signature?.dataUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTemplateChange({
                                    signature: { ...currentTemplate.signature!, dataUrl: null },
                                  })
                                }
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {currentTemplate.signature && (
                          <>
                            <div className="space-y-2">
                              <Label>Size: {currentTemplate.signature.size}px</Label>
                              <Slider
                                min={40}
                                max={200}
                                step={10}
                                value={[currentTemplate.signature.size]}
                                onValueChange={([value]) =>
                                  handleTemplateChange({
                                    signature: { ...currentTemplate.signature!, size: value },
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Position</Label>
                              <Select
                                value={currentTemplate.signature.position}
                                onValueChange={(value) =>
                                  handleTemplateChange({
                                    signature: {
                                      ...currentTemplate.signature!,
                                      position: value as PositionPreset,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                  <SelectItem value="top-left">Top Left</SelectItem>
                                  <SelectItem value="top-right">Top Right</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Content */}
                    <AccordionItem value="content">
                      <AccordionTrigger>Document Content</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="template-headline">Headline</Label>
                          <Input
                            id="template-headline"
                            placeholder="Document headline"
                            value={currentTemplate.headline || ''}
                            onChange={(e) => handleTemplateChange({ headline: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Placeholders</Label>
                          <div className="flex flex-wrap gap-1">
                            {placeholders.map((p) => (
                              <Button
                                key={p.value}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => insertPlaceholder(p.value)}
                              >
                                {p.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="template-body">Body</Label>
                          <Textarea
                            id="template-body"
                            rows={12}
                            value={currentTemplate.body || ''}
                            onChange={(e) => handleTemplateChange({ body: e.target.value })}
                            className="font-mono text-xs"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Right side: Live A4 Preview */}
                <div className="flex-1 min-w-0">
                  <div className="sticky top-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewOpen(true)}
                      >
                        Full Preview
                      </Button>
                    </div>

                    {/* Scaled A4 preview */}
                    <div
                      className="relative overflow-hidden rounded-lg border border-border bg-white shadow-sm"
                      style={{
                        width: '100%',
                        paddingBottom: '141.4%', // A4 aspect ratio
                        position: 'relative',
                      }}
                    >
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ fontSize: '8px' }}
                      >
                        {/* Header */}
                        {showHeader && (
                          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                            <div className="flex-1 min-w-0 pr-2">
                              {hasBusinessName && (
                                <div className="font-bold text-gray-900 truncate" style={{ fontSize: '10px' }}>
                                  {currentTemplate.businessName}
                                </div>
                              )}
                              {hasBusinessAddress && (
                                <div className="text-gray-500 truncate" style={{ fontSize: '7px' }}>
                                  {currentTemplate.businessAddress}
                                </div>
                              )}
                            </div>
                            {hasLogo && (
                              <img
                                src={currentTemplate.logoDataUrl!}
                                alt="Logo"
                                className="h-6 w-auto object-contain flex-shrink-0"
                              />
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="px-4 py-2">
                          <div className="text-center font-bold text-gray-900 mb-1" style={{ fontSize: '9px' }}>
                            {currentTemplate.headline}
                          </div>
                          <div className="text-gray-700 whitespace-pre-wrap leading-tight" style={{ fontSize: '6px' }}>
                            {currentTemplate.body?.substring(0, 300)}
                            {(currentTemplate.body?.length || 0) > 300 ? '…' : ''}
                          </div>
                        </div>

                        {/* Signature & Seal row */}
                        {showSignatureRow && (
                          <div className="absolute bottom-8 left-4 right-4 flex items-end justify-between">
                            {hasSignature && (
                              <div className="flex flex-col items-center">
                                <img
                                  src={currentTemplate.signature!.dataUrl!}
                                  alt="Signature"
                                  className="h-4 w-auto object-contain"
                                />
                                <div className="border-t border-gray-300 text-gray-500 text-center" style={{ fontSize: '5px' }}>
                                  Authorized Signature
                                </div>
                              </div>
                            )}
                            {hasSeal && (
                              <div className="flex flex-col items-center">
                                <img
                                  src={currentTemplate.seal!.dataUrl!}
                                  alt="Seal"
                                  className="h-4 w-auto object-contain"
                                />
                                <div className="border-t border-gray-300 text-gray-500 text-center" style={{ fontSize: '5px' }}>
                                  Official Stamp
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        {currentTemplate.footerText && (
                          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 px-4 py-1 text-center text-gray-500" style={{ fontSize: '5px' }}>
                            {currentTemplate.footerText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        template={currentTemplate}
        formData={formData}
        documentType={activeTab}
      />

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
            placeholder="Template name"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomTemplate()}
            className="my-2"
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
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
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
    </div>
  );
}
