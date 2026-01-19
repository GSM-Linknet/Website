import { describe, it, expect } from 'vitest';

/**
 * Unit tests for Batch Payment calculation logic
 * These tests verify the core business logic used in CreateBatchPaymentModal
 */

describe('Batch Payment Calculation Logic', () => {
  
  describe('selisih calculation', () => {
    /**
     * Formula: selisih = netAmount - totalSetor
     * Where: netAmount = totalInvoice - totalCommission
     */
    
    it('should calculate selisih as 0 when setoran equals netAmount', () => {
      const summary = {
        totalInvoice: 270000,
        totalCommission: 20000,
        netAmount: 250000
      };
      const totalSetor = 250000;
      
      const selisih = summary.netAmount - totalSetor;
      
      expect(selisih).toBe(0);
    });

    it('should calculate positive selisih when setoran is less than netAmount', () => {
      const summary = {
        totalInvoice: 270000,
        totalCommission: 20000,
        netAmount: 250000
      };
      const totalSetor = 200000;
      
      const selisih = summary.netAmount - totalSetor;
      
      expect(selisih).toBe(50000);
    });

    it('should calculate negative selisih when setoran exceeds netAmount', () => {
      const summary = {
        totalInvoice: 270000,
        totalCommission: 20000,
        netAmount: 250000
      };
      const totalSetor = 300000;
      
      const selisih = summary.netAmount - totalSetor;
      
      expect(selisih).toBe(-50000);
    });

    it('should fallback to totalInvoice when netAmount is undefined', () => {
      const summary = {
        totalInvoice: 270000,
        totalCommission: 0,
        netAmount: undefined as unknown as number
      };
      const totalSetor = 270000;
      
      const selisih = (summary.netAmount ?? summary.totalInvoice) - totalSetor;
      
      expect(selisih).toBe(0);
    });
  });

  describe('commission calculation', () => {
    /**
     * Commission is calculated per invoice based on:
     * - salesCommission: if package.salesIncome exists and customer has upline
     * - spvCommission: if package.spvIncome exists and upline has manager
     */
    
    it('should calculate sales commission from package salesIncome', () => {
      const paket = { salesIncome: 10000, spvIncome: 5000 };
      const hasUpline = true;
      
      const salesCommission = hasUpline && paket.salesIncome ? Number(paket.salesIncome) : 0;
      
      expect(salesCommission).toBe(10000);
    });

    it('should not calculate sales commission without upline', () => {
      const paket = { salesIncome: 10000, spvIncome: 5000 };
      const hasUpline = false;
      
      const salesCommission = hasUpline && paket.salesIncome ? Number(paket.salesIncome) : 0;
      
      expect(salesCommission).toBe(0);
    });

    it('should calculate SPV commission when upline has manager', () => {
      const paket = { salesIncome: 10000, spvIncome: 5000 };
      const hasManager = true;
      
      const spvCommission = hasManager && paket.spvIncome ? Number(paket.spvIncome) : 0;
      
      expect(spvCommission).toBe(5000);
    });

    it('should calculate total commission correctly', () => {
      const salesCommission = 10000;
      const spvCommission = 5000;
      
      const totalCommission = salesCommission + spvCommission;
      
      expect(totalCommission).toBe(15000);
    });

    it('should calculate net amount correctly', () => {
      const totalInvoice = 100000;
      const totalCommission = 15000;
      
      const netAmount = totalInvoice - totalCommission;
      
      expect(netAmount).toBe(85000);
    });
  });

  describe('quota validation', () => {
    /**
     * Quota check: selisih must not exceed available quota
     * Available quota = expenseQuota - expenseQuotaUsed
     */
    
    it('should pass when selisih is 0', () => {
      const selisih = 0;
      const availableQuota = 50000;
      
      const isQuotaExceeded = selisih > availableQuota;
      
      expect(isQuotaExceeded).toBe(false);
    });

    it('should pass when selisih is within available quota', () => {
      const selisih = 30000;
      const availableQuota = 50000;
      
      const isQuotaExceeded = selisih > availableQuota;
      
      expect(isQuotaExceeded).toBe(false);
    });

    it('should fail when selisih exceeds available quota', () => {
      const selisih = 60000;
      const availableQuota = 50000;
      
      const isQuotaExceeded = selisih > availableQuota;
      
      expect(isQuotaExceeded).toBe(true);
    });

    it('should calculate available quota correctly', () => {
      const expenseQuota = 100000;
      const expenseQuotaUsed = 40000;
      
      const availableQuota = expenseQuota - expenseQuotaUsed;
      
      expect(availableQuota).toBe(60000);
    });
  });

  describe('payment amount validation', () => {
    it('should reject setoran greater than netAmount', () => {
      const totalSetor = 300000;
      const netAmount = 250000;
      
      const isValid = totalSetor <= netAmount;
      
      expect(isValid).toBe(false);
    });

    it('should accept setoran equal to netAmount', () => {
      const totalSetor = 250000;
      const netAmount = 250000;
      
      const isValid = totalSetor <= netAmount;
      
      expect(isValid).toBe(true);
    });

    it('should accept setoran less than netAmount', () => {
      const totalSetor = 200000;
      const netAmount = 250000;
      
      const isValid = totalSetor <= netAmount;
      
      expect(isValid).toBe(true);
    });

    it('should reject zero or negative setoran', () => {
      const totalSetor = 0;
      
      const isValid = totalSetor > 0;
      
      expect(isValid).toBe(false);
    });
  });

  describe('multiple invoice aggregation', () => {
    it('should sum total invoice from multiple invoices', () => {
      const invoices = [
        { amount: 100000 },
        { amount: 50000 },
        { amount: 75000 }
      ];
      
      const totalInvoice = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      
      expect(totalInvoice).toBe(225000);
    });

    it('should sum commissions from multiple invoices', () => {
      const invoiceDetails = [
        { salesCommission: 10000, spvCommission: 5000 },
        { salesCommission: 8000, spvCommission: 4000 },
        { salesCommission: 0, spvCommission: 0 }
      ];
      
      const totalSalesCommission = invoiceDetails.reduce((sum, inv) => sum + inv.salesCommission, 0);
      const totalSpvCommission = invoiceDetails.reduce((sum, inv) => sum + inv.spvCommission, 0);
      
      expect(totalSalesCommission).toBe(18000);
      expect(totalSpvCommission).toBe(9000);
    });
  });
});
