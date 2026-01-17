import { useFetch } from "@/hooks/useFetch";
import batchPaymentService from "@/services/batch-payment.service";
import type { BatchPayment } from "@/services/batch-payment.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Batch Payment data.
 */
export function useBatchPayments(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<BatchPayment>(
    (query) => batchPaymentService.findAll(query),
    { query: initialQuery, autoFetch: true }
  );

  return {
    ...fetchResult,
  };
}

export default useBatchPayments;
