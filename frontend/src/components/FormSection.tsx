import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Download, Loader2, Share2, IndianRupee, Landmark } from 'lucide-react';
import { FormData, CustomField, DocumentType, LoanType } from '../types/form';
import { Template } from '../types/templates';
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
  customTemplates: Template[];
}

const LOAN_TYPES: LoanType[] = [
  'Home Loan',
  'Personal Loan',
  'Business Loan',
  'Vehicle Loan',
  'Education Loan',
];

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
      const filename = `${typeof docType === 'string' ? docType.replace(/\s+/g, '_') : docType}.pdf`;
      const shared = await sharePdf(pdfBlob, filename);
      if (!shared) {
        // Fallback to download if sharing not supported
        downloadFile(pdfBlob, filename);
        toast.success('PDF downloaded (sharing not supported on this device)');
      } else {
        toast.success('PDF shared successfully');
      }
    } catch (error) {
      toast.error('Failed to share PDF');
    } finally {
      setSharingDoc(null);
    }
  };

  const builtInDocTypes: DocumentType[] = [
    'Loan Approval Letter',
    'Loan Section Letter',
    'TDS Deduction Intimation',
    'GST Letter',
  ];

  const emiValue = parseFloat(formData.monthlyEmi) || 0;

  return (
    <div className="space-y-6">
      {/* Loan Details Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Loan Details
          </CardTitle>
          <CardDescription>Enter the applicant and loan information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Applicant Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Applicant Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Loan Type */}
          <div className="space-y-1.5">
            <Label htmlFor="loanType">Loan Type</Label>
            <Select
              value={formData.loanType}
              onValueChange={(value) => onFormChange({ ...formData, loanType: value as LoanType })}
            >
              <SelectTrigger id="loanType">
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loan Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="loanAmount"
                type="number"
                placeholder="0"
                className="pl-9"
                value={formData.loanAmount}
                onChange={(e) => onFormChange({ ...formData, loanAmount: e.target.value })}
              />
            </div>
          </div>

          {/* Interest Rate & Tenure */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                placeholder="0.00"
                value={formData.interestRate}
                onChange={(e) => onFormChange({ ...formData, interestRate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Tenure (Years)</Label>
              <Input
                id="year"
                type="number"
                placeholder="0"
                value={formData.year}
                onChange={(e) => onFormChange({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          {/* EMI Display */}
          {emiValue > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Estimated Monthly EMI</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(emiValue)}</p>
            </div>
          )}

          {/* Processing Charge */}
          <div className="space-y-1.5">
            <Label htmlFor="processingCharge">Processing Charge (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="processingCharge"
                type="number"
                placeholder="0"
                className="pl-9"
                value={formData.processingCharge}
                onChange={(e) => onFormChange({ ...formData, processingCharge: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Bank Details</CardTitle>
          <CardDescription>Payment and disbursement information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
            <Input
              id="bankAccountNumber"
              placeholder="Enter account number"
              value={formData.bankAccountNumber}
              onChange={(e) => onFormChange({ ...formData, bankAccountNumber: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              placeholder="Enter IFSC code"
              value={formData.ifscCode}
              onChange={(e) => onFormChange({ ...formData, ifscCode: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="Enter UPI ID"
              value={formData.upiId}
              onChange={(e) => onFormChange({ ...formData, upiId: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Custom Fields</CardTitle>
          <CardDescription>Add additional information to your documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.customFields.map((field) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => handleUpdateCustomField(field.id, e.target.value, field.value)}
                />
                <Input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => handleUpdateCustomField(field.id, field.label, e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveCustomField(field.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                placeholder="Field label"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
              />
              <Input
                placeholder="Field value"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleAddCustomField}
              disabled={!newFieldLabel.trim() || !newFieldValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Documents Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Generate Documents</CardTitle>
          <CardDescription>Download loan documents as PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {builtInDocTypes.map((docType) => (
            <div key={docType} className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 justify-start gap-2 h-10"
                onClick={() => onDownload(docType)}
                disabled={isGenerating === docType || sharingDoc === docType}
              >
                {isGenerating === docType ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="truncate">{docType}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => handleShare(docType)}
                disabled={isGenerating === docType || sharingDoc === docType}
                title={`Share ${docType}`}
              >
                {sharingDoc === docType ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}

          {customTemplates.length > 0 && (
            <>
              <div className="pt-2 pb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Templates</p>
              </div>
              {customTemplates.map((template, index) => {
                const templateId = template.id ?? template.name ?? `custom-${index}`;
                const templateName = template.name ?? template.id ?? 'Unnamed Template';
                return (
                  <div key={templateId} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 justify-start gap-2 h-10"
                      onClick={() => onDownload(templateId)}
                      disabled={isGenerating === templateId || sharingDoc === templateId}
                    >
                      {isGenerating === templateId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <Badge variant="secondary" className="text-xs mr-1">Custom</Badge>
                      <span className="truncate">{templateName}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => handleShare(templateId)}
                      disabled={isGenerating === templateId || sharingDoc === templateId}
                      title={`Share ${templateName}`}
                    >
                      {sharingDoc === templateId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
