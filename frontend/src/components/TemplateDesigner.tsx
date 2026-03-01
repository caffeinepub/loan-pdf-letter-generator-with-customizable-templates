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
import type { DocumentType } from '../types/form';
import type { FormData } from '../types/form';
import {
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
  onSaveCustomTemplateToBackend?: (template: CustomTemplate) => Promise<void>;
}

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
  onSaveCustomTemplateToBackend,
}: TemplateDesignerProps) {
  const [activeTab, setActiveTab] = useState<'builtIn' | 'custom'>('builtIn');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Loan Approval Letter');
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const builtInDocTypes: DocumentType[] = [
    'Loan Approval Letter',
    'Loan Section Letter',
    'TDS Deduction Intimation',
    'GST Letter',
  ];

  const activeBuiltIn = builtInTemplates[selectedDocType];
  const activeCustom = customTemplates.find((t) => t.id === selectedCustomId) ?? null;
  const activeTemplate = activeTab === 'builtIn' ? activeBuiltIn : activeCustom;

  const handleFileUpload = useCallback(
    async (
      field: 'logoDataUrl' | 'seal.dataUrl' | 'signature.dataUrl' | 'background.dataUrl',
      file: File
    ) => {
      try {
        const dataUrl = await fileToDataUrl(file);
        if (activeTab === 'builtIn') {
          if (field === 'logoDataUrl') {
            onUpdateBuiltInTemplate(selectedDocType, { logoDataUrl: dataUrl });
          } else if (field === 'seal.dataUrl') {
            onUpdateBuiltInTemplate(selectedDocType, {
              seal: { ...activeBuiltIn.seal!, dataUrl },
            });
          } else if (field === 'signature.dataUrl') {
            onUpdateBuiltInTemplate(selectedDocType, {
              signature: { ...activeBuiltIn.signature!, dataUrl },
            });
          } else if (field === 'background.dataUrl') {
            onUpdateBuiltInTemplate(selectedDocType, {
              background: { ...activeBuiltIn.background!, dataUrl },
            });
          }
        } else if (activeCustom) {
          if (field === 'logoDataUrl') {
            onUpdateCustomTemplate(activeCustom.id, { logoDataUrl: dataUrl });
          } else if (field === 'seal.dataUrl') {
            onUpdateCustomTemplate(activeCustom.id, {
              seal: { ...activeCustom.seal!, dataUrl },
            });
          } else if (field === 'signature.dataUrl') {
            onUpdateCustomTemplate(activeCustom.id, {
              signature: { ...activeCustom.signature!, dataUrl },
            });
          } else if (field === 'background.dataUrl') {
            onUpdateCustomTemplate(activeCustom.id, {
              background: { ...activeCustom.background!, dataUrl },
            });
          }
        }
      } catch (err) {
        toast.error('Failed to upload image', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    },
    [activeTab, selectedDocType, activeBuiltIn, activeCustom, onUpdateBuiltInTemplate, onUpdateCustomTemplate]
  );

  const handleSaveToBackend = async () => {
    if (!activeCustom || !onSaveCustomTemplateToBackend) return;
    try {
      await onSaveCustomTemplateToBackend(activeCustom);
      toast.success('Template saved to cloud!');
    } catch {
      // error already set in hook
    }
  };

  if (!activeTemplate) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>No template selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Error Alert */}
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Save Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{saveError}</span>
            <Button variant="ghost" size="icon" onClick={onClearSaveError} className="h-6 w-6">
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'builtIn' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('builtIn')}
        >
          Built-in Templates
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('custom')}
        >
          Custom Templates
        </Button>
      </div>

      {/* Built-in Template Selector */}
      {activeTab === 'builtIn' && (
        <div className="flex gap-2 flex-wrap">
          {builtInDocTypes.map((dt) => (
            <Button
              key={dt}
              variant={selectedDocType === dt ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDocType(dt)}
            >
              {dt}
            </Button>
          ))}
        </div>
      )}

      {/* Custom Template Selector */}
      {activeTab === 'custom' && (
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {customTemplates.map((t) => (
              <Button
                key={t.id}
                variant={selectedCustomId === t.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCustomId(t.id)}
              >
                {t.name}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!newTemplateName.trim()) return;
                onCreateCustomTemplate(newTemplateName.trim());
                setNewTemplateName('');
              }}
              disabled={!newTemplateName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-[600px] pr-2">
        <div className="space-y-4">
          <Accordion type="multiple" defaultValue={['content', 'watermark']}>
            {/* Document Content */}
            <AccordionItem value="content">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Document Content
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Document Title</Label>
                      <Input
                        value={activeTemplate.headline}
                        onChange={(e) => {
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, { headline: e.target.value });
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, { headline: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Document Body</Label>
                      <Textarea
                        value={activeTemplate.body}
                        onChange={(e) => {
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, { body: e.target.value });
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, { body: e.target.value });
                          }
                        }}
                        rows={12}
                        className="font-mono text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Watermark */}
            <AccordionItem value="watermark">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Watermark
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activeTemplate.watermark?.enabled ?? false}
                        onCheckedChange={(checked) => {
                          const update = { watermark: { ...activeTemplate.watermark!, enabled: checked } };
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, update);
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, update);
                          }
                        }}
                      />
                      <Label>Enable Watermark</Label>
                    </div>
                    {activeTemplate.watermark?.enabled && (
                      <>
                        <div className="space-y-2">
                          <Label>Watermark Text</Label>
                          <Input
                            value={activeTemplate.watermark?.text ?? ''}
                            onChange={(e) => {
                              const update = { watermark: { ...activeTemplate.watermark!, text: e.target.value } };
                              if (activeTab === 'builtIn') {
                                onUpdateBuiltInTemplate(selectedDocType, update);
                              } else if (activeCustom) {
                                onUpdateCustomTemplate(activeCustom.id, update);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Opacity: {Math.round((activeTemplate.watermark?.opacity ?? 0.05) * 100)}%</Label>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[Math.round((activeTemplate.watermark?.opacity ?? 0.05) * 100)]}
                            onValueChange={([val]) => {
                              const update = { watermark: { ...activeTemplate.watermark!, opacity: val / 100 } };
                              if (activeTab === 'builtIn') {
                                onUpdateBuiltInTemplate(selectedDocType, update);
                              } else if (activeCustom) {
                                onUpdateCustomTemplate(activeCustom.id, update);
                              }
                            }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Seal */}
            <AccordionItem value="seal">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Official Seal
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activeTemplate.seal?.enabled ?? false}
                        onCheckedChange={(checked) => {
                          const update = { seal: { ...activeTemplate.seal!, enabled: checked } };
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, update);
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, update);
                          }
                        }}
                      />
                      <Label>Enable Seal</Label>
                    </div>
                    {activeTemplate.seal?.enabled && (
                      <div className="space-y-2">
                        <Label>Upload Seal Image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('seal.dataUrl', file);
                          }}
                        />
                        {activeTemplate.seal?.dataUrl && (
                          <img
                            src={activeTemplate.seal.dataUrl}
                            alt="Seal preview"
                            className="h-16 w-16 object-contain border rounded"
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Signature */}
            <AccordionItem value="signature">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Signature
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activeTemplate.signature?.enabled ?? false}
                        onCheckedChange={(checked) => {
                          const update = { signature: { ...activeTemplate.signature!, enabled: checked } };
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, update);
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, update);
                          }
                        }}
                      />
                      <Label>Enable Signature</Label>
                    </div>
                    {activeTemplate.signature?.enabled && (
                      <div className="space-y-2">
                        <Label>Upload Signature Image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('signature.dataUrl', file);
                          }}
                        />
                        {activeTemplate.signature?.dataUrl && (
                          <img
                            src={activeTemplate.signature.dataUrl}
                            alt="Signature preview"
                            className="h-16 object-contain border rounded"
                          />
                        )}
                        <div className="space-y-2">
                          <Label>Signatory Name</Label>
                          <Input
                            value={activeTemplate.signature?.signatoryName ?? ''}
                            onChange={(e) => {
                              const update = { signature: { ...activeTemplate.signature!, signatoryName: e.target.value } };
                              if (activeTab === 'builtIn') {
                                onUpdateBuiltInTemplate(selectedDocType, update);
                              } else if (activeCustom) {
                                onUpdateCustomTemplate(activeCustom.id, update);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Signatory Title</Label>
                          <Input
                            value={activeTemplate.signature?.signatoryTitle ?? ''}
                            onChange={(e) => {
                              const update = { signature: { ...activeTemplate.signature!, signatoryTitle: e.target.value } };
                              if (activeTab === 'builtIn') {
                                onUpdateBuiltInTemplate(selectedDocType, update);
                              } else if (activeCustom) {
                                onUpdateCustomTemplate(activeCustom.id, update);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Header / Branding */}
            <AccordionItem value="branding">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Branding
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input
                        value={activeTemplate.businessName ?? ''}
                        onChange={(e) => {
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, { businessName: e.target.value });
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, { businessName: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Address</Label>
                      <Input
                        value={activeTemplate.businessAddress ?? ''}
                        onChange={(e) => {
                          if (activeTab === 'builtIn') {
                            onUpdateBuiltInTemplate(selectedDocType, { businessAddress: e.target.value });
                          } else if (activeCustom) {
                            onUpdateCustomTemplate(activeCustom.id, { businessAddress: e.target.value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Logo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('logoDataUrl', file);
                        }}
                      />
                      {activeTemplate.logoDataUrl && (
                        <img
                          src={activeTemplate.logoDataUrl}
                          alt="Logo preview"
                          className="h-12 object-contain border rounded"
                        />
                      )}
                    </div>
                    {activeTab === 'builtIn' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onApplyHeaderToAll(
                            activeTemplate.businessName ?? '',
                            activeTemplate.businessAddress ?? '',
                            activeTemplate.logoDataUrl ?? null
                          )
                        }
                      >
                        Apply to All Templates
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap pt-2">
            {activeTab === 'builtIn' && (
              <Button
                size="sm"
                onClick={() => onSaveBuiltInTemplate(selectedDocType)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save Template
              </Button>
            )}

            {activeTab === 'custom' && activeCustom && (
              <>
                <Button
                  size="sm"
                  onClick={() => onSaveBuiltInTemplate(selectedDocType)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save Local
                </Button>
                {onSaveCustomTemplateToBackend && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveToBackend}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-1" />
                    )}
                    Save to Cloud
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteConfirmId(activeCustom.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Preview Dialog — uses correct prop name: documentType */}
      {previewOpen && activeTemplate && (
        <PreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          template={activeTemplate}
          formData={formData}
          documentType={activeTab === 'builtIn' ? selectedDocType : (activeCustom?.name ?? 'Custom')}
        />
      )}

      {/* Delete Confirmation */}
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
              onClick={() => {
                if (deleteConfirmId) {
                  onDeleteCustomTemplate(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setSelectedCustomId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
