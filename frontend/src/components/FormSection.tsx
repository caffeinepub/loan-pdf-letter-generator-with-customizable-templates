import React, { useMemo } from 'react';
import { FormData, CustomField, LOAN_TYPE_LABELS, LoanType } from '../types/form';
import { Template } from '../types/templates';
import { validateForm } from '../lib/validation';
import { calculateEmi, formatCurrency } from '../lib/loan/calculateEmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  FileText,
  User,
  DollarSign,
  Building2,
  Settings,
  Calculator,
  AlertCircle,
} from 'lucide-react';

interface FormSectionProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onGenerate: () => void;
  selectedTemplate: Template | undefined;
  customTemplates: Template[];
  onOpenTemplateDesigner: () => void;
}

export default function FormSection({
  formData,
  onChange,
  onGenerate,
  selectedTemplate,
  customTemplates,
  onOpenTemplateDesigner,
}: FormSectionProps) {
  const update = (field: keyof FormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const emi = useMemo(() => {
    const p = parseFloat(formData.loanAmount);
    const r = parseFloat(formData.interestRate);
    const t = parseInt(formData.tenureYears, 10);
    if (p > 0 && r > 0 && t > 0) return calculateEmi(p, r, t);
    return 0;
  }, [formData.loanAmount, formData.interestRate, formData.tenureYears]);

  const validation = useMemo(() => validateForm(formData), [formData]);

  const addCustomField = () => {
    update('customFields', [...formData.customFields, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const updated = formData.customFields.map((f, i) =>
      i === index ? { ...f, ...field } : f
    );
    update('customFields', updated);
  };

  const removeCustomField = (index: number) => {
    update('customFields', formData.customFields.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (!validation.isValid) return;
    onGenerate();
  };

  const allDocTypes = [
    ...Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    ...customTemplates.map((t) => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className="space-y-5">
      {/* Document Type & Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Document Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="documentType">Loan Type</Label>
              <Select
                value={formData.documentType}
                onValueChange={(v) => update('documentType', v)}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  {allDocTypes.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={onOpenTemplateDesigner}
              >
                <Settings className="h-4 w-4" />
                Template Designer
              </Button>
            </div>
          </div>
          {selectedTemplate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{selectedTemplate.name}</Badge>
              <span>template selected</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applicant Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Applicant Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Enter applicant's full name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="applicant@email.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Full address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Loan Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
              <Input
                id="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={(e) => update('loanAmount', e.target.value)}
                placeholder="e.g. 500000"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="interestRate">Interest Rate (% p.a.) *</Label>
              <Input
                id="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={(e) => update('interestRate', e.target.value)}
                placeholder="e.g. 8.5"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tenureYears">Tenure (Years) *</Label>
              <Input
                id="tenureYears"
                type="number"
                value={formData.tenureYears}
                onChange={(e) => update('tenureYears', e.target.value)}
                placeholder="e.g. 20"
                min="1"
                step="1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="processingCharge">Processing Charge (₹)</Label>
              <Input
                id="processingCharge"
                type="number"
                value={formData.processingCharge}
                onChange={(e) => update('processingCharge', e.target.value)}
                placeholder="e.g. 5000"
                min="0"
              />
            </div>
          </div>

          {/* EMI Display */}
          {emi > 0 && (
            <div className="mt-2 p-3 bg-accent rounded-lg flex items-center gap-3">
              <Calculator className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Monthly EMI</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(emi)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Bank Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => update('accountNumber', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => update('ifscCode', e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => update('bankName', e.target.value)}
                placeholder="e.g. State Bank of India"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Custom Fields
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addCustomField} className="gap-1">
              <Plus className="h-3 w-3" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        {formData.customFields.length > 0 && (
          <CardContent className="space-y-2">
            {formData.customFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={field.key}
                  onChange={(e) => updateCustomField(index, { key: e.target.value })}
                  placeholder="Field name"
                  className="flex-1"
                />
                <Input
                  value={field.value}
                  onChange={(e) => updateCustomField(index, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomField(index)}
                  className="text-destructive hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Validation Errors */}
      {!validation.isValid && formData.name && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Generate Button */}
      <Button
        className="w-full h-12 text-base font-semibold gap-2"
        onClick={handleGenerate}
        disabled={!validation.isValid}
      >
        <FileText className="h-5 w-5" />
        Generate Document
      </Button>
    </div>
  );
}
