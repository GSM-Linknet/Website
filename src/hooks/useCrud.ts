import { useState, useCallback } from "react";

interface UseCrudOptions {
  /** Callback after successful create */
  onCreateSuccess?: () => void;
  /** Callback after successful update */
  onUpdateSuccess?: () => void;
  /** Callback after successful delete */
  onDeleteSuccess?: () => void;
  /** Callback on any error */
  onError?: (error: Error) => void;
}

interface UseCrudResult<T> {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

interface CrudService<T> {
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<any>;
}

/**
 * Generic hook for CRUD operations with loading states.
 *
 * @param service - Object containing create, update, delete methods
 * @param options - Callbacks for success/error handling
 */
export function useCrud<T>(
  service: CrudService<T>,
  options: UseCrudOptions = {}
): UseCrudResult<T> {
  const { onCreateSuccess, onUpdateSuccess, onDeleteSuccess, onError } = options;

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const create = useCallback(
    async (data: Partial<T>): Promise<T | null> => {
      if (!service.create) {
        console.warn("Create method not provided");
        return null;
      }

      setCreating(true);
      try {
        const result = await service.create(data);
        onCreateSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Create failed");
        onError?.(error);
        console.error("useCrud create error:", err);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [service, onCreateSuccess, onError]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T | null> => {
      if (!service.update) {
        console.warn("Update method not provided");
        return null;
      }

      setUpdating(true);
      try {
        const result = await service.update(id, data);
        onUpdateSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Update failed");
        onError?.(error);
        console.error("useCrud update error:", err);
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [service, onUpdateSuccess, onError]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!service.delete) {
        console.warn("Delete method not provided");
        return false;
      }

      setDeleting(true);
      try {
        await service.delete(id);
        onDeleteSuccess?.();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Delete failed");
        onError?.(error);
        console.error("useCrud delete error:", err);
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [service, onDeleteSuccess, onError]
  );

  return {
    creating,
    updating,
    deleting,
    create,
    update,
    remove,
  };
}

export default useCrud;
