/**
 * Export Buttons Component
 * Reusable buttons for Excel and PDF export
 */

import { useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/report.constants';

interface ExportButtonsProps {
    onExportExcel: () => Promise<void>;
    onExportPDF: () => Promise<void>;
    disabled?: boolean;
}

export function ExportButtons({ onExportExcel, onExportPDF, disabled = false }: ExportButtonsProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: 'excel' | 'pdf', exportFn: () => Promise<void>) => {
        try {
            setIsExporting(true);
            await exportFn();
            toast.success(SUCCESS_MESSAGES.EXPORT_SUCCESS);
        } catch (error) {
            console.error(`Export ${type} error:`, error);
            toast.error(ERROR_MESSAGES.EXPORT_FAILED);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleExport('excel', onExportExcel)}
                disabled={disabled || isExporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
                <FileSpreadsheet size={16} />
                Export Excel
            </button>

            <button
                onClick={() => handleExport('pdf', onExportPDF)}
                disabled={disabled || isExporting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
                <FileText size={16} />
                Export PDF
            </button>
        </div>
    );
}
