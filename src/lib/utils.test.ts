import { describe, it, expect } from 'vitest';
import { formatCurrency, cn } from './utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly in IDR', () => {
      const result = formatCurrency(100000);
      expect(result).toContain('Rp');
      expect(result).toContain('100.000');
    });

    it('should format large numbers with thousand separators', () => {
      const result = formatCurrency(1500000);
      expect(result).toContain('Rp');
      expect(result).toContain('1.500.000');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('Rp');
      expect(result).toContain('0');
    });

    it('should format negative numbers correctly', () => {
      const result = formatCurrency(-50000);
      expect(result).toContain('50.000');
    });

    it('should round decimal values', () => {
      const result = formatCurrency(150000.75);
      expect(result).toContain('Rp');
      expect(result).toContain('150.001');
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'inactive')).toBe('base active');
    });

    it('should merge tailwind classes properly', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should filter out falsy values', () => {
      expect(cn('base', null, undefined, '', 'end')).toBe('base end');
    });
  });
});
