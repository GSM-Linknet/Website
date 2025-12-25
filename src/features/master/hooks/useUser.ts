import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { UserService } from "@/services/user.service";
import type { User } from "@/services/user.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing User data.
 */
export function useUser(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<User>(
    (query) => UserService.findAll(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<User>(
    {
      create: UserService.create,
      update: UserService.update,
      delete: UserService.delete,
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

export default useUser;
