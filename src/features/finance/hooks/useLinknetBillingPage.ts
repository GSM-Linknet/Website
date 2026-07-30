import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useLinknetBilling } from "./useLinknetBilling";
import type { LinknetPeriodFilter } from "@/services/linknet-billing.service";

export function useLinknetBillingPage() {
    const { toast } = useToast();
    const currentDate = new Date();
    
    const [queryFilter, setQueryFilter] = useState<LinknetPeriodFilter>({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
    });

    const linknetBilling = useLinknetBilling(queryFilter);

    const [isExporting, setIsExporting] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("packages");

    const handleFilterChange = (updates: Partial<LinknetPeriodFilter>) => {
        const newFilter = { ...queryFilter, ...updates };
        setQueryFilter(newFilter);
        linknetBilling.setQuery(newFilter);
        setSelectedInvoiceIds([]);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exportQuery: any = { ...queryFilter };
            if (activeTab === "unpaid") exportQuery.isPaidToLinknet = 'false';
            else if (activeTab === "history") exportQuery.isPaidToLinknet = 'true';
            else if (activeTab === "shortfall") exportQuery.isKurangBayar = 'true';
            else if (activeTab === "shortfallHistory") exportQuery.isKurangBayarPaid = 'true';

            await linknetBilling.exportExcel(exportQuery as LinknetPeriodFilter);
            toast({
                title: "Berhasil",
                description: "File laporan Linknet berhasil diunduh.",
            });
        } catch (error) {
            toast({
                title: "Gagal",
                description: "Gagal mengunduh file laporan.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            const res = await linknetBilling.recalculateCommissions(queryFilter.month, queryFilter.year);
            toast({
                title: "Berhasil",
                description: `Berhasil menghitung ulang komisi untuk ${res?.data?.processed || 0} tagihan.`,
            });
            linknetBilling.setQuery(queryFilter);
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal menghitung ulang komisi.",
                variant: "destructive"
            });
        } finally {
            setIsRecalculating(false);
        }
    };

    const handlePayToLinknet = async () => {
        if (selectedInvoiceIds.length === 0) return;
        setIsPaying(true);
        try {
            const res = await linknetBilling.payToLinknet(selectedInvoiceIds);
            toast({
                title: "Berhasil",
                description: `Berhasil menandai ${res?.data?.count || 0} tagihan sebagai telah dibayar ke Linknet.`,
            });
            setSelectedInvoiceIds([]);
            linknetBilling.refresh(queryFilter);
        } catch (error: any) {
             toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal menandai pembayaran.",
                variant: "destructive"
            });
        } finally {
            setIsPaying(false);
        }
    };
    
    const handlePayKurangBayar = async () => {
        if (selectedInvoiceIds.length === 0) return;
        setIsPaying(true);
        try {
            const res = await linknetBilling.payKurangBayar(selectedInvoiceIds);
            toast({
                title: "Berhasil",
                description: `Berhasil menandai ${res?.data?.count || 0} tagihan kurang bayar sebagai lunas.`,
            });
            setSelectedInvoiceIds([]);
            linknetBilling.refresh(queryFilter);
        } catch (error: any) {
             toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal menandai pembayaran.",
                variant: "destructive"
            });
        } finally {
            setIsPaying(false);
        }
    };

    return {
        queryFilter,
        currentDate,
        ...linknetBilling, // Spread recapData, packages, detail, unpaid, history, shortfall, loadingRecap
        isExporting,
        isRecalculating,
        isPaying,
        selectedInvoiceIds,
        setSelectedInvoiceIds,
        isPayoutModalOpen,
        setIsPayoutModalOpen,
        activeTab,
        setActiveTab,
        handleFilterChange,
        handleExport,
        handleRecalculate,
        handlePayToLinknet,
        handlePayKurangBayar
    };
}
