import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Template } from '../types/templates';
import { BUILT_IN_TEMPLATES } from '../lib/templates/getTemplate';
import { fileToDataUrl } from '../lib/templateAssets/fileToDataUrl';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  X,
  Upload,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface TemplateDesignerProps {
  open: boolean;
  onClose: () => void;
  customTemplates: Template[];
  onAddCustomTemplate: (template: Template) => void;
  onUpdateCustomTemplate: (id: string, updates: Partial<Template>) => void;
  onDeleteCustomTemplate: (id: string) => void;
  selectedDocType: string;
  onSelectDocType: (docType: string) => void;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  isBuiltIn,
}: {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isBuiltIn: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{template.name}</h3>
              {isBuiltIn && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Built-in
                </Badge>
              )}
              {isSelected && (
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.headline}
            </p>
          </div>
          {!isBuiltIn && (
            <div className="flex gap-1 flex-shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: Partial<Template>;
  onSave: (t: Template) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Template>>(template);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof Template, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      update('logoDataUrl', dataUrl);
    } catch {}
  };

  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      update('seal', {
        ...(form.seal || { size: 80, position: 'bottom-right', rotation: 0, fit: 'contain', enabled: true }),
        dataUrl,
        enabled: true,
      });
    } catch {}
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      update('signature', {
        ...(form.signature || { enabled: true }),
        dataUrl,
        enabled: true,
      });
    } catch {}
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.headline?.trim()) return;
    setSaving(true);
    try {
      const id = form.id || `custom-${Date.now()}`;
      onSave({
        id,
        name: form.name || '',
        documentType: form.documentType || id,
        headline: form.headline || '',
        body: form.body || '',
        businessName: form.businessName || 'Bajaj Finserv',
        businessAddress: form.businessAddress || '',
        watermarkText: form.watermarkText || '',
        watermarkOpacity: form.watermarkOpacity ?? 0.08,
        showWatermark: form.showWatermark ?? false,
        footerText: form.footerText || '',
        footerLayout: form.footerLayout || 'centered',
        headerColor: form.headerColor || '#003087',
        showQrCode: form.showQrCode ?? false,
        qrPayload: form.qrPayload || '',
        signatureLayout: form.signatureLayout || 'sideBySide',
        logoDataUrl: form.logoDataUrl,
        backgroundDataUrl: form.backgroundDataUrl,
        seal: form.seal,
        signature: form.signature,
        optionalCustomFieldLabel: form.optionalCustomFieldLabel,
        optionalCustomFieldValue: form.optionalCustomFieldValue,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Template Name *</Label>
          <Input
            value={form.name || ''}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. My Custom Loan"
          />
        </div>
        <div className="space-y-1">
          <Label>Document Type ID</Label>
          <Input
            value={form.documentType || ''}
            onChange={(e) => update('documentType', e.target.value)}
            placeholder="e.g. custom-home"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Document Headline *</Label>
        <Input
          value={form.headline || ''}
          onChange={(e) => update('headline', e.target.value)}
          placeholder="e.g. LOAN SANCTION LETTER"
        />
      </div>

      <div className="space-y-1">
        <Label>Document Body</Label>
        <Textarea
          value={form.body || ''}
          onChange={(e) => update('body', e.target.value)}
          placeholder="Use {{name}}, {{loanAmount}}, {{emi}}, etc. as placeholders"
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Available placeholders: {'{{name}}'}, {'{{loanAmount}}'}, {'{{interestRate}}'},{' '}
          {'{{tenureYears}}'}, {'{{emi}}'}, {'{{processingCharge}}'}, {'{{accountNumber}}'},{' '}
          {'{{ifscCode}}'}, {'{{bankName}}'}
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Business Name</Label>
          <Input
            value={form.businessName || ''}
            onChange={(e) => update('businessName', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Header Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={form.headerColor || '#003087'}
              onChange={(e) => update('headerColor', e.target.value)}
              className="w-12 h-9 p-1 cursor-pointer"
            />
            <Input
              value={form.headerColor || '#003087'}
              onChange={(e) => update('headerColor', e.target.value)}
              placeholder="#003087"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Business Address</Label>
        <Input
          value={form.businessAddress || ''}
          onChange={(e) => update('businessAddress', e.target.value)}
        />
      </div>

      <Separator />

      {/* Watermark */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Watermark</Label>
          <Switch
            checked={form.showWatermark ?? false}
            onCheckedChange={(v) => update('showWatermark', v)}
          />
        </div>
        {form.showWatermark && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Watermark Text</Label>
              <Input
                value={form.watermarkText || ''}
                onChange={(e) => update('watermarkText', e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Opacity (0-1)</Label>
              <Input
                type="number"
                value={form.watermarkOpacity ?? 0.08}
                onChange={(e) => update('watermarkOpacity', parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Image uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Logo</Label>
          <label className="flex items-center gap-2 cursor-pointer border rounded-md p-2 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {form.logoDataUrl ? 'Logo uploaded' : 'Upload logo'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Seal / Stamp</Label>
          <label className="flex items-center gap-2 cursor-pointer border rounded-md p-2 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {form.seal?.dataUrl ? 'Seal uploaded' : 'Upload seal'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleSealUpload} />
          </label>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Signature</Label>
          <label className="flex items-center gap-2 cursor-pointer border rounded-md p-2 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {form.signature?.dataUrl ? 'Signature uploaded' : 'Upload signature'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSignatureUpload}
            />
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Footer Text</Label>
        <Input
          value={form.footerText || ''}
          onChange={(e) => update('footerText', e.target.value)}
          placeholder="e.g. Company Name | www.example.com"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.name?.trim() || !form.headline?.trim()}
          className="flex-1"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Template
        </Button>
      </div>
    </div>
  );
}

export default function TemplateDesigner({
  open,
  onClose,
  customTemplates,
  onAddCustomTemplate,
  onUpdateCustomTemplate,
  onDeleteCustomTemplate,
  selectedDocType,
  onSelectDocType,
}: TemplateDesignerProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'edit'>('browse');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates];

  const handleSelectTemplate = (template: Template) => {
    onSelectDocType(template.documentType);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setActiveTab('edit');
  };

  const handleSaveNew = (template: Template) => {
    onAddCustomTemplate(template);
    setActiveTab('browse');
  };

  const handleSaveEdit = (template: Template) => {
    if (editingTemplate) {
      onUpdateCustomTemplate(editingTemplate.id, template);
    }
    setEditingTemplate(null);
    setActiveTab('browse');
  };

  const handleDelete = (id: string) => {
    onDeleteCustomTemplate(id);
    if (selectedDocType === id) {
      onSelectDocType('home');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-xl">Template Designer</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-4 flex-shrink-0">
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            {activeTab === 'edit' && <TabsTrigger value="edit">Edit Template</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Built-in Templates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUILT_IN_TEMPLATES.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        isSelected={selectedDocType === t.documentType}
                        onSelect={() => handleSelectTemplate(t)}
                        isBuiltIn={true}
                      />
                    ))}
                  </div>
                </div>

                {customTemplates.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Custom Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customTemplates.map((t) => (
                        <TemplateCard
                          key={t.id}
                          template={t}
                          isSelected={selectedDocType === t.documentType || selectedDocType === t.id}
                          onSelect={() => handleSelectTemplate(t)}
                          onEdit={() => handleEdit(t)}
                          onDelete={() => handleDelete(t.id)}
                          isBuiltIn={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-6 py-4">
              <TemplateEditor
                template={{
                  businessName: 'Bajaj Finserv',
                  businessAddress:
                    'Bajaj Auto Limited Complex, Mumbai - Pune Road, Akurdi, Pune - 411035',
                  headerColor: '#003087',
                  showWatermark: false,
                  watermarkText: '',
                  watermarkOpacity: 0.08,
                  footerLayout: 'centered',
                  signatureLayout: 'sideBySide',
                  showQrCode: false,
                  qrPayload: '',
                }}
                onSave={handleSaveNew}
                onCancel={() => setActiveTab('browse')}
              />
            </ScrollArea>
          </TabsContent>

          {activeTab === 'edit' && editingTemplate && (
            <TabsContent value="edit" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full px-6 py-4">
                <TemplateEditor
                  template={editingTemplate}
                  onSave={handleSaveEdit}
                  onCancel={() => {
                    setEditingTemplate(null);
                    setActiveTab('browse');
                  }}
                />
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
