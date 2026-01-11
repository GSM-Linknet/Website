import { useState, memo } from 'react';
import { Calendar } from 'lucide-react';
import { DATE_RANGES, DATE_RANGE_LABELS } from '../constants/report.constants';
import { getDateRangePreset } from '../utils/report.utils';

interface DateRangeFilterProps {
    onFilterChange: (startDate: Date, endDate: Date) => void;
    defaultRange?: string;
}

export const DateRangeFilter = memo(({ onFilterChange, defaultRange = DATE_RANGES.THIS_MONTH }: DateRangeFilterProps) => {
    const [selectedRange, setSelectedRange] = useState(defaultRange);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);

        if (range !== DATE_RANGES.CUSTOM) {
            const { startDate, endDate } = getDateRangePreset(range);
            onFilterChange(startDate, endDate);
        }
    };

    const handleCustomDateApply = () => {
        if (customStartDate && customEndDate) {
            onFilterChange(new Date(customStartDate), new Date(customEndDate));
        }
    };

    return (
        <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periode Laporan
                </label>
                <select
                    value={selectedRange}
                    onChange={(e) => handleRangeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {Object.entries(DATE_RANGE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {selectedRange === DATE_RANGES.CUSTOM && (
                <>
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal Akhir
                        </label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleCustomDateApply}
                        disabled={!customStartDate || !customEndDate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Calendar size={16} />
                        Terapkan
                    </button>
                </>
            )}
        </div>
    );
});

DateRangeFilter.displayName = 'DateRangeFilter';
