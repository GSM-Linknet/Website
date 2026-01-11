import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { CustomerService } from "@/services/customer.service";
import type { Customer } from "@/services/customer.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Customer data.
 */
export function useCustomers(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Customer>(
    (query) => CustomerService.getCustomers({...query, order: "createdAt:desc"}),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Customer>(
    {
      create: CustomerService.createCustomer,
      update: CustomerService.updateCustomer,
      delete: CustomerService.deleteCustomer,
    },
    {
      onCreateSuccess: fetchResult.refetch,
      onUpdateSuccess: fetchResult.refetch,
      onDeleteSuccess: fetchResult.refetch,
    }
  );

  return {
    ...fetchResult,
    ...crudResult,
  };
}

export default useCustomers;
