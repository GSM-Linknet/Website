import { useState, useCallback, useEffect } from "react";
import { LinknetBillingApiService, type LinknetPeriodFilter, type LinknetBillingRecap, type LinknetPackageRecap, type LinknetDetailItem } from "@/services/linknet-billing.service";
import useFetch from "@/hooks/useFetch";

export function useLinknetBilling(initialQuery: LinknetPeriodFilter) {
  const [recapData, setRecapData] = useState<LinknetBillingRecap | null>(null);
  const [loadingRecap, setLoadingRecap] = useState<boolean>(true);
  const [errorRecap, setErrorRecap] = useState<Error | null>(null);

  // For paginated details table
  const detailFetch = useFetch<LinknetDetailItem>(
    (query: any) => LinknetBillingApiService.getDetail(query as LinknetPeriodFilter),
    { query: initialQuery, autoFetch: true }
  );

  const packagesFetch = useFetch<LinknetPackageRecap>(
    (query: any) => LinknetBillingApiService.getByPackage(query as LinknetPeriodFilter),
    { query: initialQuery, autoFetch: true }
  );

  const unpaidFetch = useFetch<LinknetDetailItem>(
    (query: any) => LinknetBillingApiService.getDetail({ ...(query as LinknetPeriodFilter), isPaidToLinknet: false }),
    { query: initialQuery, autoFetch: true }
  );
  
  const shortfallFetch = useFetch<LinknetDetailItem>(
    (query: any) => LinknetBillingApiService.getDetail({ ...(query as LinknetPeriodFilter), isKurangBayar: 'true' } as any),
    { query: initialQuery, autoFetch: true }
  );

  const historyFetch = useFetch<LinknetDetailItem>(
    (query: any) => LinknetBillingApiService.getDetail({ ...(query as LinknetPeriodFilter), isPaidToLinknet: true }),
    { query: initialQuery, autoFetch: true }
  );

  const shortfallHistoryFetch = useFetch<LinknetDetailItem>(
    (query: any) => LinknetBillingApiService.getDetail({ ...(query as LinknetPeriodFilter), isKurangBayarPaid: 'true' } as any),
    { query: initialQuery, autoFetch: true }
  );

  const fetchRecap = useCallback(async (query: LinknetPeriodFilter) => {
    setLoadingRecap(true);
    try {
      const response = await LinknetBillingApiService.getRecap(query);
      if (response && response.data) {
        setRecapData(response.data);
      }
    } catch (err: any) {
      setErrorRecap(err);
      console.error("Error fetching recap:", err);
    } finally {
      setLoadingRecap(false);
    }
  }, []);

  useEffect(() => {
    fetchRecap(initialQuery);
  }, []);

  return {
    recapData,
    loadingRecap,
    errorRecap,
    setQuery: (updatedQuery: LinknetPeriodFilter) => {
      detailFetch.setQuery(updatedQuery);
      packagesFetch.setQuery(updatedQuery);
      unpaidFetch.setQuery(updatedQuery);
      historyFetch.setQuery(updatedQuery);
      shortfallFetch.setQuery(updatedQuery);
      shortfallHistoryFetch.setQuery(updatedQuery);
      fetchRecap(updatedQuery);
    },
    refresh: (currentQuery?: LinknetPeriodFilter) => {
      detailFetch.refetch();
      packagesFetch.refetch();
      unpaidFetch.refetch();
      historyFetch.refetch();
      shortfallFetch.refetch();
      shortfallHistoryFetch.refetch();
      fetchRecap(currentQuery || initialQuery);
    },
    packages: packagesFetch,
    detail: detailFetch,
    unpaid: unpaidFetch,
    shortfall: shortfallFetch,
    history: historyFetch,
    shortfallHistory: shortfallHistoryFetch,
    exportExcel: async (query: LinknetPeriodFilter) => {
      await LinknetBillingApiService.downloadExcel(query);
    },
    recalculateCommissions: async (month: number, year: number) => {
      return await LinknetBillingApiService.recalculateCommissions(month, year);
    },
    payToLinknet: async (invoiceIds: string[]) => {
      return await LinknetBillingApiService.payToLinknet(invoiceIds);
    },
    payKurangBayar: async (invoiceIds: string[]) => {
      return await LinknetBillingApiService.payKurangBayar(invoiceIds);
    }
  };
}
