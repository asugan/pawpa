import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';

interface BaseResource {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CrudOptions<T, Context = unknown> {
  listQueryKey: QueryKey;
  detailQueryKey?: (id: string) => QueryKey;
  onSuccess?: (data: T, variables: any, context: Context) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: any, context: Context | undefined) => void;
}

export function useCreateResource<T extends BaseResource, Input>(
  mutationFn: (data: Input) => Promise<T>,
  options: CrudOptions<T, { previousList: T[] | undefined }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: options.listQueryKey });

      // Snapshot the previous value
      const previousList = queryClient.getQueryData<T[]>(options.listQueryKey);

      // Optimistically update to the new value
      const tempId = `temp-${Date.now()}`;
      const tempItem = {
        ...newData,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as T;

      queryClient.setQueryData<T[]>(options.listQueryKey, (old) =>
        old ? [...old, tempItem] : [tempItem]
      );

      return { previousList };
    },
    onError: (err, newData, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(options.listQueryKey, context.previousList);
      }
    },
    onSuccess: options.onSuccess,
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: options.listQueryKey });
      if (options.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
  });
}

export function useUpdateResource<T extends BaseResource, Input>(
  mutationFn: (params: { id: string; data: Input }) => Promise<T>,
  options: CrudOptions<T, { previousList: T[] | undefined; previousDetail: T | undefined }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: options.listQueryKey });
      if (options.detailQueryKey) {
        await queryClient.cancelQueries({ queryKey: options.detailQueryKey(id) });
      }

      const previousList = queryClient.getQueryData<T[]>(options.listQueryKey);
      const previousDetail = options.detailQueryKey
        ? queryClient.getQueryData<T>(options.detailQueryKey(id))
        : undefined;

      // Optimistically update detail
      if (options.detailQueryKey) {
        queryClient.setQueryData<T>(options.detailQueryKey(id), (old) =>
          old
            ? { ...old, ...data, updatedAt: new Date().toISOString() }
            : undefined
        );
      }

      // Optimistically update list
      queryClient.setQueryData<T[]>(options.listQueryKey, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === id
            ? { ...item, ...data, updatedAt: new Date().toISOString() }
            : item
        );
      });

      return { previousList, previousDetail };
    },
    onError: (err, { id }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(options.listQueryKey, context.previousList);
      }
      if (context?.previousDetail && options.detailQueryKey) {
        queryClient.setQueryData(options.detailQueryKey(id), context.previousDetail);
      }
    },
    onSuccess: options.onSuccess,
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: options.listQueryKey });
      if (options.detailQueryKey) {
        queryClient.invalidateQueries({ queryKey: options.detailQueryKey(variables.id) });
      }
      if (options.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
  });
}

export function useDeleteResource<T extends BaseResource>(
  mutationFn: (id: string) => Promise<void | string>,
  options: CrudOptions<T, { previousList: T[] | undefined }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: options.listQueryKey });

      const previousList = queryClient.getQueryData<T[]>(options.listQueryKey);

      queryClient.setQueryData<T[]>(options.listQueryKey, (old) =>
        old?.filter((item) => item.id !== id)
      );

      return { previousList };
    },
    onError: (err, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(options.listQueryKey, context.previousList);
      }
    },
    onSuccess: (data, variables, context) => {
       // Remove detail query if it exists
       if (options.detailQueryKey) {
         queryClient.removeQueries({ queryKey: options.detailQueryKey(variables) });
       }
       if (options.onSuccess) {
         // @ts-ignore - data might be void or string, but T is expected in signature. 
         // In delete case, we might not have the full object back.
         // Adjusting types might be needed if strictness is required.
         options.onSuccess(data as unknown as T, variables, context);
       }
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: options.listQueryKey });
      if (options.onSettled) {
         // @ts-ignore
        options.onSettled(data, error, variables, context);
      }
    },
  });
}
