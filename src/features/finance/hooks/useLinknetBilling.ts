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



  // We can drive the fetches based on a single source of truth for the active query.
  // Since we pass initialQuery to detailFetch, we can export a refetch function if needed.

  useEffect(() => {
    // Initial fetch for the summary parts
    fetchRecap(initialQuery);
  }, []); // Run once on mount. Further updates handled manually via applyQuery or a dedicated state

  return {
    recapData,
    loadingRecap,
    errorRecap,
    // Provide a unified setQuery that updates everything
    setQuery: (updatedQuery: LinknetPeriodFilter) => {
      detailFetch.setQuery(updatedQuery);
      packagesFetch.setQuery(updatedQuery);
      fetchRecap(updatedQuery);
    },
    packages: packagesFetch,
    detail: detailFetch,
    exportExcel: async (query: LinknetPeriodFilter, token?: string) => {
      await LinknetBillingApiService.downloadExcel(query, token);
    }
  };
}
