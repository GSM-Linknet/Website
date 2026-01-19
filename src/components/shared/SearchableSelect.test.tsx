import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchableSelect } from '@/components/shared/SearchableSelect';

const mockOptions = [
    { id: '1', name: 'Option One', role: 'ADMIN' },
    { id: '2', name: 'Option Two', role: 'SALES' },
    { id: '3', name: 'Another Choice' },
];

describe('SearchableSelect', () => {
    it('renders with placeholder', () => {
        render(
            <SearchableSelect
                options={mockOptions}
                onValueChange={vi.fn()}
                placeholder="Select something"
            />
        );
        expect(screen.getByText('Select something')).toBeDefined();
    });

    it('opens dropdown when clicked', () => {
        render(
            <SearchableSelect
                options={mockOptions}
                onValueChange={vi.fn()}
            />
        );

        const button = screen.getByRole('combobox');
        fireEvent.click(button);

        expect(screen.getByPlaceholderText('Cari...')).toBeDefined();
        expect(screen.getByText('Option One')).toBeDefined();
    });

    it('filters options based on search input', () => {
        render(
            <SearchableSelect
                options={mockOptions}
                onValueChange={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('combobox'));
        const input = screen.getByPlaceholderText('Cari...');

        fireEvent.change(input, { target: { value: 'Another' } });

        expect(screen.queryByText('Option One')).toBeNull();
        expect(screen.getByText('Another Choice')).toBeDefined();
    });

    it('calls onValueChange when an option is selected', () => {
        const onValueChange = vi.fn();
        render(
            <SearchableSelect
                options={mockOptions}
                onValueChange={onValueChange}
            />
        );

        fireEvent.click(screen.getByRole('combobox'));
        fireEvent.click(screen.getByText('Option One'));

        expect(onValueChange).toHaveBeenCalledWith('1');
        expect(screen.queryByPlaceholderText('Cari...')).toBeNull(); // Should close
    });

    it('shows empty message when no results found', () => {
        render(
            <SearchableSelect
                options={mockOptions}
                onValueChange={vi.fn()}
                emptyMessage="Nothing here"
            />
        );

        fireEvent.click(screen.getByRole('combobox'));
        fireEvent.change(screen.getByPlaceholderText('Cari...'), { target: { value: 'XYZ' } });

        expect(screen.getByText('Nothing here')).toBeDefined();
    });
});
