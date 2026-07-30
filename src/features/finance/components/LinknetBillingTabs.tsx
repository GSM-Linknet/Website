import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { Landmark, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CreatePayoutModal } from "./CreatePayoutModal";
import { 
    packagesColumns, 
    detailColumns, 
    historyColumns, 
    getUnpaidColumns, 
    getShortfallColumns,
    shortfallHistoryColumns
} from "./LinknetBillingColumns";
import type { LinknetDetailItem, LinknetBillingRecap } from "@/services/linknet-billing.service";

interface Props {
    activeTab: string;
    setActiveTab: (val: string) => void;
    recapData?: LinknetBillingRecap | null;
    packages: any;
    detail: any;
    unpaid: any;
    history: any;
    shortfall: any;
    shortfallHistory: any;
    selectedInvoiceIds: string[];
    setSelectedInvoiceIds: React.Dispatch<React.SetStateAction<string[]>>;
    isPaying: boolean;
    isPayoutModalOpen: boolean;
    setIsPayoutModalOpen: (val: boolean) => void;
    handlePayToLinknet: () => void;
    handlePayKurangBayar: () => void;
}

export function LinknetBillingTabs({
    activeTab,
    setActiveTab,
    recapData,
    packages,
    detail,
    unpaid,
    history,
    shortfall,
    shortfallHistory,
    selectedInvoiceIds,
    setSelectedInvoiceIds,
    isPaying,
    isPayoutModalOpen,
    setIsPayoutModalOpen,
    handlePayToLinknet,
    handlePayKurangBayar
}: Props) {
    const unpaidCols = React.useMemo(() => getUnpaidColumns(unpaid.data, selectedInvoiceIds, setSelectedInvoiceIds), [unpaid.data, selectedInvoiceIds, setSelectedInvoiceIds]);
    const shortfallCols = React.useMemo(() => getShortfallColumns(shortfall.data, selectedInvoiceIds, setSelectedInvoiceIds), [shortfall.data, selectedInvoiceIds, setSelectedInvoiceIds]);

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 bg-white border border-slate-100 shadow-sm p-1 rounded-xl flex flex-wrap h-auto">
                <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none">
                    Rekap Per Paket
                </TabsTrigger>
                <TabsTrigger value="detail" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none">
                    Semua Tagihan Lunas
                </TabsTrigger>
                <TabsTrigger value="unpaid" className="rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-none">
                    Antrean Setoran Linknet
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none">
                    Riwayat Setoran
                </TabsTrigger>
                <TabsTrigger value="shortfall" className="rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-none">
                    Rekap Kurang Bayar
                </TabsTrigger>
                <TabsTrigger value="shortfallHistory" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none">
                    Riwayat Pelunasan KB
                </TabsTrigger>
            </TabsList>

            <TabsContent value="packages" className="mt-0">
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                    <h3 className="text-lg font-bold text-[#101D42] mb-4 flex items-center">
                        Rekap HPP & Penjualan Paket
                    </h3>
                    <BaseTable
                        tableId="finance-linknet-packages"
                        data={packages.data}
                        columns={packagesColumns}
                        rowKey={(row) => row.packageCode}
                        className="border-none shadow-none"
                        loading={packages.loading}
                        page={packages.page}
                        totalPages={packages.totalPages}
                        totalItems={packages.totalItems}
                        onPageChange={packages.setPage}
                    />
                </div>
            </TabsContent>

            <TabsContent value="detail" className="mt-0">
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-lg font-bold text-[#101D42] flex items-center">
                            Semua Rincian Pembayaran Pelanggan
                        </h3>
                    </div>

                    <BaseTable
                        tableId="finance-linknet-detail"
                        data={detail.data}
                        columns={detailColumns}
                        rowKey={(row) => row.invoiceNumber}
                        className="border-none shadow-none"
                        loading={detail.loading}
                        page={detail.page}
                        totalPages={detail.totalPages}
                        totalItems={detail.totalItems}
                        onPageChange={detail.setPage}
                    />
                </div>
            </TabsContent>

            <TabsContent value="unpaid" className="mt-0">
                <div className="bg-white rounded-[2rem] p-6 border border-orange-100 shadow-xl shadow-orange-200/40 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-orange-900 flex items-center">
                                Antrean Setoran Linknet
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Daftar tagihan yang sudah lunas tetapi HPP belum disetorkan ke Linknet.</p>
                        </div>
                        
                        {selectedInvoiceIds.length > 0 && (() => {
                            const totalBayarLinknet = unpaid.data?.filter((i: LinknetDetailItem) => selectedInvoiceIds.includes(i.id)).reduce((sum: number, item: LinknetDetailItem) => sum + item.bayarLinknet, 0) || 0;
                            return (
                                <>
                                    <Button 
                                        disabled={isPaying}
                                        onClick={() => setIsPayoutModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg"
                                    >
                                        <Landmark className="mr-2 w-4 h-4" />
                                        Buat Payout ({selectedInvoiceIds.length}) - {formatCurrency(totalBayarLinknet)}
                                    </Button>
                                    <CreatePayoutModal 
                                        isOpen={isPayoutModalOpen}
                                        onClose={() => setIsPayoutModalOpen(false)}
                                        onSuccess={handlePayToLinknet}
                                        defaultAmount={totalBayarLinknet.toString()}
                                        defaultCategory="OPERATIONAL"
                                        hideSourceBucket={true}
                                        defaultSourceBucket="REVENUE"
                                        hideBalanceInfo={true}
                                    />
                                </>
                            );
                        })()}
                    </div>

                    <BaseTable
                        tableId="finance-linknet-unpaid"
                        data={unpaid.data}
                        columns={unpaidCols}
                        rowKey={(row) => row.id}
                        className="border-none shadow-none"
                        loading={unpaid.loading}
                        page={unpaid.page}
                        totalPages={unpaid.totalPages}
                        totalItems={unpaid.totalItems}
                        onPageChange={unpaid.setPage}
                    />
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
                <div className="bg-white rounded-[2rem] p-6 border border-green-100 shadow-xl shadow-green-200/40 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-green-900 flex items-center">
                                Riwayat Setoran Linknet
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 mb-3">Daftar tagihan yang sudah disetorkan ke pihak Linknet.</p>

                            {recapData?.summary?.totalSettledLinknet !== undefined && (
                                <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100 shadow-sm">
                                    <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Total Telah Disetorkan:</span>
                                    <span className="text-lg font-black font-mono text-green-600">{formatCurrency(recapData.summary.totalSettledLinknet)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <BaseTable
                        tableId="finance-linknet-history"
                        data={history.data}
                        columns={historyColumns}
                        rowKey={(row) => row.id}
                        className="border-none shadow-none"
                        loading={history.loading}
                        page={history.page}
                        totalPages={history.totalPages}
                        totalItems={history.totalItems}
                        onPageChange={history.setPage}
                    />
                </div>
            </TabsContent>

            <TabsContent value="shortfall" className="mt-0">
                <div className="bg-white rounded-[2rem] p-6 border border-red-100 shadow-xl shadow-red-200/40 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-red-900 flex items-center">
                                Rekap Kurang Bayar HPP
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 mb-3">Daftar tagihan yang nilai pembayarannya kurang dari modal HPP.</p>
                            
                            {recapData?.summary?.totalUnpaidKurangBayar !== undefined && (
                                <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm">
                                    <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Total Seluruh Kurang Bayar:</span>
                                    <span className="text-lg font-black font-mono text-red-600">{formatCurrency(recapData.summary.totalUnpaidKurangBayar)}</span>
                                </div>
                            )}
                        </div>
                        
                        {selectedInvoiceIds.length > 0 && (() => {
                            const totalKurangBayar = shortfall.data?.filter((i: LinknetDetailItem) => selectedInvoiceIds.includes(i.id)).reduce((sum: number, item: LinknetDetailItem) => sum + item.totalKurangBayar, 0) || 0;
                            return (
                                <Button 
                                    disabled={isPaying}
                                    onClick={handlePayKurangBayar}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg"
                                >
                                    <Activity className="mr-2 w-4 h-4" />
                                    Tandai Sudah Dibayar ({selectedInvoiceIds.length}) - {formatCurrency(totalKurangBayar)}
                                </Button>
                            );
                        })()}
                    </div>

                    <BaseTable
                        tableId="finance-linknet-shortfall"
                        data={shortfall.data}
                        columns={shortfallCols}
                        rowKey={(row) => row.id}
                        className="border-none shadow-none"
                        loading={shortfall.loading}
                        page={shortfall.page}
                        totalPages={shortfall.totalPages}
                        totalItems={shortfall.totalItems}
                        onPageChange={shortfall.setPage}
                    />
                </div>
            </TabsContent>

            <TabsContent value="shortfallHistory" className="mt-0">
                <div className="bg-white rounded-[2rem] p-6 border border-blue-100 shadow-xl shadow-blue-200/40 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 flex items-center">
                                Riwayat Pelunasan Kurang Bayar
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Daftar tagihan kurang bayar yang sudah dilunasi/diselesaikan.</p>
                        </div>
                    </div>

                    <BaseTable
                        tableId="finance-linknet-shortfall-history"
                        data={shortfallHistory.data}
                        columns={shortfallHistoryColumns}
                        rowKey={(row) => row.id}
                        className="border-none shadow-none"
                        loading={shortfallHistory.loading}
                        page={shortfallHistory.page}
                        totalPages={shortfallHistory.totalPages}
                        totalItems={shortfallHistory.totalItems}
                        onPageChange={shortfallHistory.setPage}
                    />
                </div>
            </TabsContent>
        </Tabs>
    );
}
