"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContractFormProps {
  isEdit: boolean;
  contractNumber: string;
  company: string;
  companyId: string;
  companyPhone: string;
  description: string;
  startDate: string;
  endDate: string;
  onContractNumberChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onCompanyIdChange: (value: string) => void;
  onCompanyPhoneChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

/**
 * Shared contract form that visually matches the Organization dialog:
 * - When editing: only contract number and company fields are shown.
 * - When adding: all fields are shown.
 */
export function ContractForm({
  isEdit,
  contractNumber,
  company,
  companyId,
  companyPhone,
  description,
  startDate,
  endDate,
  onContractNumberChange,
  onCompanyChange,
  onCompanyIdChange,
  onCompanyPhoneChange,
  onDescriptionChange,
  onStartDateChange,
  onEndDateChange,
}: ContractFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div>
        <Label htmlFor="dialog-contract-number">Гэрээний дугаар *</Label>
        <Input
          id="dialog-contract-number"
          value={contractNumber}
          onChange={(e) => onContractNumberChange(e.target.value)}
          placeholder="Гэрээний дугаар оруулах"
        />
      </div>
      <div>
        <Label htmlFor="dialog-company">Компани *</Label>
        <Input
          id="dialog-company"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Компанийн нэр оруулах"
        />
      </div>
      {!isEdit && (
        <>
          <div>
            <Label htmlFor="dialog-company-id">Компанийн регистер *</Label>
            <Input
              id="dialog-company-id"
              value={companyId}
              onChange={(e) => onCompanyIdChange(e.target.value)}
              placeholder="Компанийн регистрийн дугаар оруулах"
            />
          </div>
          <div>
            <Label htmlFor="dialog-company-phone">Компанийн утасны дугаар *</Label>
            <Input
              id="dialog-company-phone"
              value={companyPhone}
              onChange={(e) => onCompanyPhoneChange(e.target.value)}
              placeholder="Компанийн утасны дугаар оруулах"
            />
          </div>
          <div>
            <Label htmlFor="dialog-description">Тайлбар</Label>
            <Input
              id="dialog-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Тайлбар оруулах (сонголттой)"
            />
          </div>
          
        </>
      )}
    </div>
  );
}

