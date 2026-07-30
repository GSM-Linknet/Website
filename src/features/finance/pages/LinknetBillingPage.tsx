import { useFetch } from "@/hooks/useFetch";
import { MasterService, type Unit } from "@/services/master.service";
import { useLinknetBillingPage } from "../hooks/useLinknetBillingPage";

// Refactored Components
import { LinknetBillingHeader } from "../components/LinknetBillingHeader";
import { LinknetBillingStats } from "../components/LinknetBillingStats";
import { LinknetBillingTabs } from "../components/LinknetBillingTabs";

export default function LinknetBillingPage() {
    const { data: units } = useFetch<Unit>(MasterService.getUnits, { query: { limit: 1000 } });
    
    const pageLogic = useLinknetBillingPage();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <LinknetBillingHeader 
                queryFilter={pageLogic.queryFilter}
                currentDate={pageLogic.currentDate}
                units={units}
                loadingRecap={pageLogic.loadingRecap}
                isRecalculating={pageLogic.isRecalculating}
                isExporting={pageLogic.isExporting}
                handleFilterChange={pageLogic.handleFilterChange}
                handleRecalculate={pageLogic.handleRecalculate}
                handleExport={pageLogic.handleExport}
            />

            {/* Quick Stats & Distribution */}
            <LinknetBillingStats 
                loadingRecap={pageLogic.loadingRecap}
                recapData={pageLogic.recapData}
            />

            {/* Content Tabs */}
            <LinknetBillingTabs 
                activeTab={pageLogic.activeTab}
                setActiveTab={pageLogic.setActiveTab}
                recapData={pageLogic.recapData}
                packages={pageLogic.packages}
                detail={pageLogic.detail}
                unpaid={pageLogic.unpaid}
                history={pageLogic.history}
                shortfall={pageLogic.shortfall}
                shortfallHistory={pageLogic.shortfallHistory}
                selectedInvoiceIds={pageLogic.selectedInvoiceIds}
                setSelectedInvoiceIds={pageLogic.setSelectedInvoiceIds}
                isPaying={pageLogic.isPaying}
                isPayoutModalOpen={pageLogic.isPayoutModalOpen}
                setIsPayoutModalOpen={pageLogic.setIsPayoutModalOpen}
                handlePayToLinknet={pageLogic.handlePayToLinknet}
                handlePayKurangBayar={pageLogic.handlePayKurangBayar}
            />
        </div>
    );
}

