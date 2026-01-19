import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BaseTable, type Column } from './BaseTable';

interface MockData {
    id: string;
    name: string;
    status: string;
}

const mockData: MockData[] = [
    { id: '1', name: 'Item One', status: 'Active' },
    { id: '2', name: 'Item Two', status: 'Pending' },
];

const mockColumns: Column<MockData>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Status', accessorKey: 'status' },
    {
        header: 'Actions',
        accessorKey: 'actions',
        cell: (item) => <button>Edit {item.id}</button>
    },
];

describe('BaseTable', () => {
    it('renders table headers and data', () => {
        render(
            <BaseTable
                data={mockData}
                columns={mockColumns}
                rowKey={(item) => item.id}
            />
        );

        expect(screen.getByText('Name')).toBeDefined();
        expect(screen.getByText('Status')).toBeDefined();
        expect(screen.getByText('Item One')).toBeDefined();
        expect(screen.getByText('Item Two')).toBeDefined();
    });

    it('renders custom cell content', () => {
        render(
            <BaseTable
                data={mockData}
                columns={mockColumns}
                rowKey={(item) => item.id}
            />
        );

        expect(screen.getByText('Edit 1')).toBeDefined();
        expect(screen.getByText('Edit 2')).toBeDefined();
    });

    it('shows loading state', () => {
        render(
            <BaseTable
                data={[]}
                columns={mockColumns}
                rowKey={(item) => item.id}
                loading={true}
            />
        );

        expect(screen.getByText('Memuat data...')).toBeDefined();
    });

    it('shows empty message when no data', () => {
        render(
            <BaseTable
                data={[]}
                columns={mockColumns}
                rowKey={(item) => item.id}
            />
        );

        expect(screen.getByText('Data tidak ditemukan')).toBeDefined();
    });
});
