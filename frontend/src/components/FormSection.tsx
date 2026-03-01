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
      const filename = `${typeof docType === 'string' ? docType.toLowerCase().replace(/\s+/g, '-') : 'document'}.png`;
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

  const builtInDocTypes: DocumentType[] = [
    'Loan Approval Letter',
    'Loan GST Letter',
    'Loan Section Letter',
    'TDS Deduction Intimation',
  ];

  const processingChargeNum = parseFloat(formData.processingCharge) || 0;
  const monthlyEmiNum = parseFloat(formData.monthlyEmi) || 0;

  return (
    <div className="space-y-6">
      {/* Applicant Details */}
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
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>Enter loan type, amount, interest rate, and tenure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loan Type */}
          <div className="space-y-2">
            <Label htmlFor="loanType">Loan Type</Label>
            <Select
              value={formData.loanType}
              onValueChange={(value) => onFormChange({ ...formData, loanType: value as LoanType })}
            >
              <SelectTrigger id="loanType">
                <SelectValue placeholder="Select Loan Type" />
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
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
            <Input
              id="loanAmount"
              type="number"
              placeholder="500000"
              value={formData.loanAmount}
              onChange={(e) => onFormChange({ ...formData, loanAmount: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              min="0"
              step="1000"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (% per annum) *</Label>
            <Input
              id="interestRate"
              type="number"
              placeholder="8.5"
              value={formData.interestRate}
              onChange={(e) => onFormChange({ ...formData, interestRate: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              min="0"
              step="0.1"
            />
          </div>

          {/* Loan Tenure */}
          <div className="space-y-2">
            <Label htmlFor="year">Loan Tenure (Years) *</Label>
            <Select
              value={formData.year}
              onValueChange={(value) => onFormChange({ ...formData, year: value })}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="max-h-60 overflow-y-auto"
                onWheel={(e) => e.stopPropagation()}
              >
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year} {year === 1 ? 'Year' : 'Years'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monthly EMI (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="monthlyEmi">Monthly EMI (₹)</Label>
            <Input
              id="monthlyEmi"
              value={monthlyEmiNum > 0 ? formatCurrency(monthlyEmiNum) : '₹0.00'}
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

      {/* Processing Charge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" />
            Processing Charge
          </CardTitle>
          <CardDescription>Enter the one-time processing fee charged for this loan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="processingCharge">Processing Charge (₹)</Label>
            <Input
              id="processingCharge"
              type="number"
              placeholder="e.g. 5000"
              value={formData.processingCharge}
              onChange={(e) => onFormChange({ ...formData, processingCharge: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Bank Account Details
          </CardTitle>
          <CardDescription>Enter the bank account details for loan disbursement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
            <Input
              id="bankAccountNumber"
              placeholder="e.g. 1234567890"
              value={formData.bankAccountNumber}
              onChange={(e) => onFormChange({ ...formData, bankAccountNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              placeholder="e.g. SBIN0001234"
              value={formData.ifscCode}
              onChange={(e) =>
                onFormChange({ ...formData, ifscCode: e.target.value.toUpperCase() })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="e.g. name@upi"
              value={formData.upiId}
              onChange={(e) => onFormChange({ ...formData, upiId: e.target.value })}
            />
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
          {formData.customFields.map((field) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={field.label}
                onChange={(e) => handleUpdateCustomField(field.id, e.target.value, field.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={field.value}
                onChange={(e) => handleUpdateCustomField(field.id, field.label, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCustomField(field.id)}
                className="text-destructive shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Field Label"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Field Value"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddCustomField}
              disabled={!newFieldLabel.trim() || !newFieldValue.trim()}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Documents</CardTitle>
          <CardDescription>Download your loan documents as PNG images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Built-in document types */}
          <div className="space-y-2">
            {builtInDocTypes.map((docType) => (
              <div key={docType} className="flex items-center gap-2">
                <Button
                  className="flex-1 justify-start gap-2"
                  variant="outline"
                  onClick={() => onDownload(docType)}
                  disabled={isGenerating === docType}
                >
                  {isGenerating === docType ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {docType}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare(docType)}
                  disabled={sharingDoc === docType}
                  title="Share document"
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

          {/* Custom templates */}
          {customTemplates.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Custom Templates</p>
              {customTemplates.map((t) => {
                const id = (t as { id?: string }).id ?? t.name ?? 'custom';
                const label = (t as { name?: string }).name ?? t.headline ?? 'Custom Template';
                return (
                  <div key={id} className="flex items-center gap-2">
                    <Button
                      className="flex-1 justify-start gap-2"
                      variant="outline"
                      onClick={() => onDownload(id)}
                      disabled={isGenerating === id}
                    >
                      {isGenerating === id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <Badge variant="secondary" className="text-xs mr-1">
                        Custom
                      </Badge>
                      {label}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare(id)}
                      disabled={sharingDoc === id}
                      title="Share document"
                    >
                      {sharingDoc === id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
