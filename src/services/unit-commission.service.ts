import { apiClient } from "./api-client";
import type { ApiResponse } from "./master.service";

export type CommissionMethod = 'AUTOMATIC' | 'MANUAL';
export type CommissionValueType = 'PERCENTAGE' | 'NOMINAL';

export interface UnitPackageCommission {
  id?: string;
  unitId: string;
  packageId: string;
  holdingValue: number;
  holdingType: CommissionValueType;
  unitValue: number;
  unitType: CommissionValueType;
  coordValue: number;
  coordType: CommissionValueType;
  spvValue: number;
  spvType: CommissionValueType;
  salesValue: number;
  salesType: CommissionValueType;
  package?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface UnitCommissionConfig {
  id?: string;
  unitId: string;
  coordinatorId?: string | null;
  
  // Registration
  regMethod: CommissionMethod;
  regHoldingValue: number;
  regHoldingType: CommissionValueType;
  regUnitValue: number;
  regUnitType: CommissionValueType;
  regCoordValue: number;
  regCoordType: CommissionValueType;
  regSpvValue: number;
  regSpvType: CommissionValueType;
  regSalesValue: number;
  regSalesType: CommissionValueType;

  // Monthly (Default)
  monthlyMethod: CommissionMethod;
  monthlyHoldingValue: number;
  monthlyHoldingType: CommissionValueType;
  monthlyUnitValue: number;
  monthlyUnitType: CommissionValueType;
  monthlyCoordValue: number;
  monthlyCoordType: CommissionValueType;
  monthlySpvValue: number;
  monthlySpvType: CommissionValueType;
  monthlySalesValue: number;
  monthlySalesType: CommissionValueType;

  // Relations
  coordinator?: {
    id: string;
    name: string;
    role: string;
  };
  
  // Package-specific overrides
  packageCommissions?: UnitPackageCommission[];
}

const ENDPOINT = "/keuangan/unit-commission";

export const UnitCommissionService = {
  getConfig: async (unitId: string) => {
    return apiClient.get<ApiResponse<UnitCommissionConfig>>(`${ENDPOINT}/${unitId}`);
  },

  saveConfig: async (unitId: string, data: Partial<UnitCommissionConfig>) => {
    return apiClient.post<ApiResponse<UnitCommissionConfig>>(`${ENDPOINT}/${unitId}`, data);
  }
};
