import {
    InfiniteData,
    UseInfiniteQueryResult,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import apiClient from '../apiClient';
import { Label } from '../queries/useGetLabels';
import {
    AttributesResult,
    GetAttributesQueryParams,
    QUERY_KEY_ATTRIBUTES
} from '../queries/useGetAttributes';

const deleteAttribute = async (id: Label['id']): Promise<void> => {
    await apiClient.delete(`/attributes/${id}`);
};

interface DeleteAttributeParams {
    id: Label['id'];
    params: GetAttributesQueryParams;
}

export const useDeleteAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, DeleteAttributeParams>({
        mutationFn: (params) => deleteAttribute(params.id),
        onMutate: async ({ id, params }) => {
            // Cancel any outgoing refetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY_ATTRIBUTES, { ...params }] });

            // Snapshot the previous value
            const previousAttributes = queryClient.getQueryData<InfiniteData<AttributesResult>>([
                QUERY_KEY_ATTRIBUTES,
                { ...params }
            ]);

            // Optimistically update to the new value
            if (previousAttributes) {
                queryClient.setQueryData<InfiniteData<AttributesResult>>(
                    [QUERY_KEY_ATTRIBUTES, { ...params }],
                    {
                        ...previousAttributes,
                        pages: [
                            ...previousAttributes.pages.map((page) => {
                                var idxInArr = page.data.findIndex(
                                    (attribute) => attribute.id === id
                                );
                                if (idxInArr === -1) {
                                    return page;
                                }
                                page.data.splice(idxInArr, 1);
                                return page;
                            })
                        ]
                    }
                );
            }

            return previousAttributes;
        },
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        onError: (err, { params }, previousAttributes) => {
            if (previousAttributes) {
                queryClient.setQueryData<InfiniteData<AttributesResult>>(
                    [QUERY_KEY_ATTRIBUTES, { ...params }],
                    previousAttributes as InfiniteData<AttributesResult>
                );
            }
        },
        // Always refetch after error or success:
        onSettled: (data, error, { params }) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ATTRIBUTES, { ...params }] });
        }
    });
};
