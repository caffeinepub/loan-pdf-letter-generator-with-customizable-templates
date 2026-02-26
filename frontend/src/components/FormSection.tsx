import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Download, Loader2, Share2 } from 'lucide-react';
import { FormData, CustomField, DocumentType } from '../types/form';
import { CustomTemplate } from '../types/templates';
import { useState, useEffect } from 'react';
import { calculateEmi, formatCurrency } from '../lib/loan/calculateEmi';
import { generatePdf } from '../lib/pdf/generatePdf';
import { downloadFile } from '../lib/download';
import { sharePdf } from '../lib/shareUtils';
import { toast } from 'sonner';

interface FormSectionProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onDownload: (docType: DocumentType | string) => void;
  isGenerating: string | null;
  customTemplates: CustomTemplate[];
}

export default function FormSection({ formData, onFormChange, onDownload, isGenerating, customTemplates }: FormSectionProps) {
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [sharingDoc, setSharingDoc] = useState<string | null>(null);

  // Auto-calculate EMI when loan amount, interest rate, or year changes
  useEffect(() => {
    const loanAmount = parseFloat(formData.loanAmount) || 0;
    const interestRate = parseFloat(formData.interestRate) || 0;
    const year = parseInt(formData.year) || 0;

    if (loanAmount > 0 && year > 0) {
      const emi = calculateEmi(loanAmount, interestRate, year);
      const formattedEmi = emi.toFixed(2);

      if (formData.monthlyEmi !== formattedEmi) {
        onFormChange({
          ...formData,
          monthlyEmi: formattedEmi,
        });
      }
    } else if (formData.monthlyEmi !== '0') {
      onFormChange({
        ...formData,
        monthlyEmi: '0',
      });
    }
  }, [formData.loanAmount, formData.interestRate, formData.year]);

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim() || !newFieldValue.trim()) return;

    const newField: CustomField = {
      id: Date.now().toString(),
      label: newFieldLabel.trim(),
      value: newFieldValue.trim(),
    };

    onFormChange({
      ...formData,
      customFields: [...formData.customFields, newField],
    });

    setNewFieldLabel('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (id: string) => {
    onFormChange({
      ...formData,
      customFields: formData.customFields.filter((field) => field.id !== id),
    });
  };

  const handleUpdateCustomField = (id: string, label: string, value: string) => {
    onFormChange({
      ...formData,
      customFields: formData.customFields.map((field) =>
        field.id === id ? { ...field, label, value } : field
      ),
    });
  };

  const handleShare = async (docType: DocumentType | string) => {
    setSharingDoc(docType);
    try {
      const pdfBlob = await generatePdf(docType, formData);
      const filename = `${typeof docType === 'string' ? docType.toLowerCase().replace(/\s+/g, '-') : 'document'}.pdf`;
      // Download first, then share
      downloadFile(pdfBlob, filename);
      const shared = await sharePdf(pdfBlob, filename);
      if (!shared) {
        toast.success('Document downloaded!', {
          description: 'Sharing not supported on this device — file downloaded instead.',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share document', {
        description: 'Please try again.',
      });
    } finally {
      setSharingDoc(null);
    }
  };

  // Generate year options (1-30 years)
  const yearOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  const builtInDocTypes: DocumentType[] = ['Loan Approval Letter', 'Loan GST Letter', 'Loan Section Letter'];

  return (
    <div className="space-y-6">
      {/* User Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Details</CardTitle>
          <CardDescription>Enter the loan applicant information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              placeholder="+91 98765 43210"
              value={formData.mobile}
              onChange={(e) => onFormChange({ ...formData, mobile: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              placeholder="123 Main Street, City, State, PIN"
              rows={3}
              value={formData.address}
              onChange={(e) => onFormChange({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="panNumber">PAN Number *</Label>
            <Input
              id="panNumber"
              placeholder="ABCDE1234F"
              value={formData.panNumber}
              onChange={(e) => onFormChange({ ...formData, panNumber: e.target.value.toUpperCase() })}
              maxLength={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>Enter loan amount, interest rate, and tenure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
            <Input
              id="loanAmount"
              type="number"
              placeholder="500000"
              value={formData.loanAmount}
              onChange={(e) => onFormChange({ ...formData, loanAmount: e.target.value })}
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (% per annum) *</Label>
            <Input
              id="interestRate"
              type="number"
              placeholder="8.5"
              value={formData.interestRate}
              onChange={(e) => onFormChange({ ...formData, interestRate: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Loan Tenure (Years) *</Label>
            <Select
              value={formData.year}
              onValueChange={(value) => onFormChange({ ...formData, year: value })}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year} {year === 1 ? 'Year' : 'Years'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyEmi">Monthly EMI (₹)</Label>
            <Input
              id="monthlyEmi"
              value={formData.monthlyEmi ? formatCurrency(parseFloat(formData.monthlyEmi)) : '₹0.00'}
              readOnly
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Automatically calculated based on loan amount, interest rate, and tenure
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>Add additional fields to include in your documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Custom Fields */}
          {formData.customFields.length > 0 && (
            <div className="space-y-3">
              {formData.customFields.map((field) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) => handleUpdateCustomField(field.id, e.target.value, field.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Field Value"
                    value={field.value}
                    onChange={(e) => handleUpdateCustomField(field.id, field.label, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveCustomField(field.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Custom Field */}
          <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Field Label (e.g., Branch)"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
              />
              <Input
                placeholder="Field Value (e.g., Mumbai)"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCustomField}
              disabled={!newFieldLabel.trim() || !newFieldValue.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Document Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Document</CardTitle>
          <CardDescription>Download your loan documents using built-in or custom templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Built-in Templates */}
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">Built-in Templates</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {builtInDocTypes.map((docType) => (
                <div key={docType} className="flex gap-1">
                  <Button
                    variant="outline"
                    className="h-auto flex-1 flex-col gap-1 py-3 text-left"
                    onClick={() => onDownload(docType)}
                    disabled={isGenerating === docType || sharingDoc === docType}
                  >
                    {isGenerating === docType ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium leading-tight">{docType}</span>
                  </Button>
                  {/* Share button — mobile only */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-auto py-3 shrink-0"
                    onClick={() => handleShare(docType)}
                    disabled={isGenerating === docType || sharingDoc === docType}
                    title={`Share ${docType} as PDF`}
                  >
                    {sharingDoc === docType ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground flex items-center gap-2">
                Custom Templates
                <Badge variant="secondary" className="text-xs">{customTemplates.length}</Badge>
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {customTemplates.map((template) => (
                  <div key={template.id} className="flex gap-1">
                    <Button
                      variant="outline"
                      className="h-auto flex-1 flex-col gap-1 py-3 text-left border-primary/30"
                      onClick={() => onDownload(template.id)}
                      disabled={isGenerating === template.id || sharingDoc === template.id}
                    >
                      {isGenerating === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-xs font-medium leading-tight">{template.name}</span>
                    </Button>
                    {/* Share button — mobile only */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden h-auto py-3 shrink-0"
                      onClick={() => handleShare(template.id)}
                      disabled={isGenerating === template.id || sharingDoc === template.id}
                      title={`Share ${template.name} as PDF`}
                    >
                      {sharingDoc === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customTemplates.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No custom templates yet. Use the Advanced Template Designer to create and save custom templates.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
