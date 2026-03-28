import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Package,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  BadgeCheck,
  Wallet,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  DateRangeFilter,
  ExportButtons,
  ReportCard,
  StatusBadge,
  ReportDataTable,
  UplineCustomerModal,
  PackageCustomerModal,
  LocationCustomerModal,
  ExemptedCustomerModal,
  CustomerLogicExplanation,
} from "../components";
import { reportService } from "@/services/reporting.service";
import type { CustomerReportData, ReportFilters } from "../types/report.types";
import {
  formatCurrency,
  formatDate,
  getDateRangePreset,
} from "../utils/report.utils";
import {
  LOADING_MESSAGES,
  ERROR_MESSAGES,
} from "../constants/report.constants";
import { BaseTable, type Column } from "@/components/shared/BaseTable";
import { TableRow, TableCell } from "@/components/ui/table";

export default function CustomerReportPage() {
  const [reportData, setReportData] = useState<CustomerReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [legacyFilter, setLegacyFilter] = useState<"all" | "new" | "legacy">(
    "all",
  );
  const [activeTab, setActiveTab] = useState<"ringkasan" | "penjelasan">(
    "ringkasan",
  );
  const [selectedUpline, setSelectedUpline] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedExemption, setSelectedExemption] = useState<string | null>(
    null,
  );
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [filters, setFilters] = useState<ReportFilters>(() => {
    const { startDate, endDate } = getDateRangePreset("month");
    return { startDate, endDate };
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.startDate, filters.endDate, legacyFilter]);

  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, [filters, legacyFilter, currentPage, pageSize]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const reportFilters = {
        ...filters,
        isLegacy: legacyFilter,
        page: currentPage,
        limit: pageSize,
        paginate: true
      };
      const data = await reportService.getCustomerReport(reportFilters);
      setReportData(data);
    } catch (error) {
      console.error("Failed to fetch customer report:", error);
      toast.error(ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = useCallback(
    (startDate: Date, endDate: Date) => {
      setFilters((prev) => ({ ...prev, startDate, endDate }));
    },
    [],
  );

  const handleExportExcel = async () => {
    await reportService.exportCustomerReportExcel({
      ...filters,
      isLegacy: legacyFilter,
    });
  };

  const handleExportPDF = async () => {
    await reportService.exportCustomerReportPDF({
      ...filters,
      isLegacy: legacyFilter,
    });
  };

  // Legacy filter tabs
  const legacyTabs = [
    { value: "all" as const, label: "Semua Customer" },
    { value: "new" as const, label: "Customer Baru" },
    { value: "legacy" as const, label: "Customer Legacy" },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "customerId",
      header: "Customer ID",
      sortable: true,
      width: "120px",
      render: (value: string) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {value}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama",
      sortable: true,
      width: "200px",
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      width: "220px",
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      width: "140px",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "package",
      header: "Paket",
      sortable: true,
      width: "150px",
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          {value}
        </span>
      ),
    },
    {
      key: "packagePrice",
      header: "Harga",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      ),
      width: "130px",
    },
    {
      key: "unit",
      header: "Unit",
      sortable: true,
      width: "150px",
    },
    {
      key: "totalBilling",
      header: "Total Tagihan",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value)}
        </span>
      ),
      width: "140px",
    },
    {
      key: "statusNet",
      header: "Status",
      render: (_: any, row: any) => {
        if (!row.statusCust)
          return <StatusBadge status="Pending" variant="warning" />;
        if (row.statusNet)
          return <StatusBadge status="Active" variant="success" />;
        return <StatusBadge status="Inactive" variant="danger" />;
      },
      width: "100px",
    },
    {
      key: "createdAt",
      header: "Tanggal Daftar",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
      width: "130px",
    },
  ];

  const packageColumns: Column<any>[] = [
    {
      header: "Nama Paket",
      accessorKey: "name",
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600 rounded-lg shadow-sm border border-purple-100/50">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-700">{item.name}</span>
        </div>
      ),
    },
    {
      header: <div className="text-right w-full">Jumlah Pelanggan</div>,
      accessorKey: "count",
      cell: (item: any) => (
        <div className="flex justify-end">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-100/50">
            {item.count.toLocaleString("id-ID")}
          </span>
        </div>
      ),
    },
    {
      header: <div className="text-right w-full">Total Revenue</div>,
      accessorKey: "revenue",
      cell: (item: any) => (
        <div className="flex justify-end">
          <span className="block text-right font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50">
            {formatCurrency(item.revenue)}
          </span>
        </div>
      ),
    },
  ];

  const locationColumns: Column<any>[] = [
    {
      header: "Area / Lokasi",
      accessorKey: "name",
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 rounded-lg shadow-sm border border-blue-100/50">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-700">{item.name}</span>
        </div>
      ),
    },
    {
      header: <div className="text-right w-full">Jumlah Pelanggan</div>,
      accessorKey: "count",
      cell: (item: any) => (
        <div className="flex justify-end">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-100/50">
            {item.count.toLocaleString("id-ID")}
          </span>
        </div>
      ),
    },
  ];

  const uplineColumns: Column<any>[] = [
    {
      header: "Nama Upline & Role",
      accessorKey: "uplineName",
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 rounded-lg shadow-sm border border-emerald-100/50">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="block font-semibold text-gray-700 text-sm mb-0.5">
              {item.uplineName}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-gray-100 text-gray-600 w-fit">
              {item.uplineRole}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: <div className="text-right w-full">Total Pelanggan</div>,
      accessorKey: "totalCustomers",
      cell: (item: any) => (
        <div className="flex justify-end">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-bold bg-white text-gray-700 shadow-sm border border-gray-100">
            <Users className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            {item.totalCustomers.toLocaleString("id-ID")}
          </span>
        </div>
      ),
    },
    {
      header: <div className="text-right w-full">Notifikasi Tunggakan</div>,
      accessorKey: "customersWithOutstanding",
      cell: (item: any) => (
        <div className="flex text-right justify-end w-full">
          {item.customersWithOutstanding > 0 ? (
            <div className="flex flex-col items-end align-right">
              <span className="flex items-center text-sm font-bold text-rose-600">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                {formatCurrency(item.totalOutstandingAmount)}
              </span>
              <span className="text-[11px] font-semibold text-rose-500 mt-1 bg-rose-50 px-2 py-0.5 rounded shadow-sm border border-rose-100/50">
                {item.customersWithOutstanding} pelanggan menunggu
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm mt-1">
              <BadgeCheck className="w-3.5 h-3.5 mr-1.5" /> Bersih / Lunas
            </span>
          )}
        </div>
      ),
    },
  ];

  const exemptedColumns: Column<any>[] = [
    {
      header: "Kategori Pengecualian",
      accessorKey: "reason",
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-600 rounded-lg shadow-sm border border-rose-100/50">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-700">{item.reason}</span>
        </div>
      ),
    },
    {
      header: <div className="text-right w-full">Jumlah Pelanggan</div>,
      accessorKey: "count",
      cell: (item: any) => (
        <div className="flex justify-end">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">
            {item.count.toLocaleString("id-ID")}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 -m-8 p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-xl p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Laporan Pelanggan
                </h1>
              </div>
              <p className="text-blue-100 text-lg">
                Analisis komprehensif data pelanggan dan performa
              </p>
            </div>
            <ExportButtons
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              disabled={!reportData || loading}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Filter Periode
              </h3>
            </div>
            {/* Legacy Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              {legacyTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setLegacyFilter(tab.value)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    legacyFilter === tab.value
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <DateRangeFilter onFilterChange={handleDateRangeChange} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-gray-700">
              {LOADING_MESSAGES.FETCHING_REPORT}
            </p>
          </div>
        ) : !reportData ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
            <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">
              {ERROR_MESSAGES.NO_DATA}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Coba ubah filter atau periode laporan
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <ReportCard
                title="Total Pelanggan"
                value={reportData.summary.total}
                icon={Users}
                variant="info"
                format="number"
              />
              <ReportCard
                title="Wajib Bayar"
                value={reportData.summary.wajibBayar}
                icon={Wallet}
                variant="default"
                format="number"
                subtitle={`${((reportData.summary.wajibBayar / reportData.summary.active) * 100).toFixed(1)}% dari pelanggan aktif`}
              />
              <ReportCard
                title="Pelanggan Aktif"
                value={reportData.summary.active}
                icon={UserCheck}
                variant="success"
                format="number"
                subtitle={`${((reportData.summary.active / reportData.summary.total) * 100).toFixed(1)}% dari total`}
              />
              <ReportCard
                title="Tidak Aktif"
                value={reportData.summary.inactive}
                icon={UserX}
                variant="warning"
                format="number"
              />
              <ReportCard
                title="Pending"
                value={reportData.summary.pending}
                icon={Clock}
                variant="danger"
                format="number"
              />
            </div>

            {/* Page Tabs */}
            <div className="flex border-b border-gray-200 mt-8 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("ringkasan")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "ringkasan" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Ringkasan Laporan
              </button>
              <button
                onClick={() => setActiveTab("penjelasan")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "penjelasan" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Rincian & Penjelasan Logic
              </button>
            </div>

            {activeTab === "ringkasan" ? (
              <>
                {/* Exempted Breakdown */}
                {reportData.exemptedBreakdown?.items &&
                  reportData.exemptedBreakdown.items.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-rose-100/60 mt-6">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg">
                          <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Analisis Pengecualian Tagihan (Pelanggan Aktif)
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Total{" "}
                            {reportData.summary.active -
                              reportData.summary.wajibBayar}{" "}
                            pelanggan aktif yang terlepas dari kewajiban tagihan
                            secara sistem.
                          </p>
                        </div>
                      </div>
                      <BaseTable
                        data={reportData.exemptedBreakdown.items}
                        columns={exemptedColumns}
                        rowKey={(item: any) => item.reason}
                        onRowClick={(item: any) =>
                          setSelectedExemption(item.reason)
                        }
                        footer={
                          <TableRow className="bg-rose-50/50 hover:bg-rose-50/50">
                            <TableCell className="font-bold text-rose-700 py-4 px-5">Total Pelanggan Tidak Wajib Bayar</TableCell>
                            <TableCell className="text-right py-4 px-5">
                              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold tracking-wide bg-rose-100 text-rose-800 border border-rose-200">
                                {(reportData.summary.active - reportData.summary.wajibBayar).toLocaleString("id-ID")}
                              </span>
                            </TableCell>
                          </TableRow>
                        }
                      />
                    </div>
                  )}
                {/* Package Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Distribusi per Paket
                    </h2>
                  </div>
                  <BaseTable
                    data={Array.isArray(reportData.byPackage) ? reportData.byPackage : reportData.byPackage.items}
                    columns={packageColumns}
                    rowKey={(item: any) => item.name}
                    onRowClick={(item: any) => setSelectedPackage(item.name)}
                  />
                </div>

                {/* Location Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Distribusi per Lokasi
                    </h2>
                  </div>
                  <BaseTable
                    data={Array.isArray(reportData.byLocation) ? reportData.byLocation : reportData.byLocation.items}
                    columns={locationColumns}
                    rowKey={(item: any) => item.name}
                    onRowClick={(item: any) => setSelectedLocation(item.name)}
                  />
                </div>

                {/* Upline Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Distribusi per Upline
                    </h2>
                  </div>
                  <BaseTable
                    data={Array.isArray(reportData.byUpline) ? reportData.byUpline : reportData.byUpline.items}
                    columns={uplineColumns}
                    rowKey={(item: any) => item.uplineId}
                    onRowClick={(item: any) => setSelectedUpline(item.uplineId)}
                  />
                </div>

                {/* Data Table */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                    Detail Pelanggan
                  </h2>
                  <ReportDataTable
                    serverSide={true}
                    data={reportData.customers}
                    columns={columns}
                    page={currentPage}
                    limit={pageSize}
                    loading={loading}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    searchPlaceholder="Cari berdasarkan nama, email, atau customer ID..."
                  />
                </div>
              </>
            ) : (
              <CustomerLogicExplanation />
            )}
          </>
        )}
      </div>

      {/* Upline Customer Details Modal */}
      <UplineCustomerModal
        open={!!selectedUpline}
        onClose={() => setSelectedUpline(null)}
        uplineId={selectedUpline}
        reportData={reportData}
      />

      {/* Package Customer Details Modal */}
      <PackageCustomerModal
        open={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        packageName={selectedPackage}
        reportData={reportData}
      />

      {/* Location Customer Details Modal */}
      <LocationCustomerModal
        open={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        locationName={selectedLocation}
        reportData={reportData}
      />

      {/* Exempted Customer Details Modal */}
      <ExemptedCustomerModal
        open={!!selectedExemption}
        onClose={() => setSelectedExemption(null)}
        exemptionName={selectedExemption}
        reportData={reportData}
      />
    </div>
  );
}
