import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { FinanceService } from "@/services/finance.service";
import type { Payment } from "@/services/finance.service";
import type { BaseQuery } from "@/services/master.service";

export function usePendingPayments(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Payment>(
    (query) => {
      const existingWhere = query?.where ? `${query.where}|` : "";
      return FinanceService.getPayments({
        ...query,
        where: `${existingWhere}status:PENDING`,
      });
    },
    { query: initialQuery, autoFetch: true }
  );

  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const approvePayment = async (id: string) => {
    try {
      setLoadingActionId(id);
      await FinanceService.approvePayment(id);
      await fetchResult.refetch();
    } finally {
      setLoadingActionId(null);
    }
  };

  const rejectPayment = async (id: string, reason: string) => {
    try {
      setLoadingActionId(id);
      await FinanceService.rejectPayment(id, reason);
      await fetchResult.refetch();
    } finally {
      setLoadingActionId(null);
    }
  };

  return {
    ...fetchResult,
    approvePayment,
    rejectPayment,
    loadingActionId,
  };
}
