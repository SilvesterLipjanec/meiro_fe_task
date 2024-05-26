import apiClient from '../apiClient';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Attribute } from './useGetAttribute';

export type SortBy = 'name' | 'createdAt';
export type SortDir = 'asc' | 'desc';

export type GetAttributesQueryParams = {
    offset: number;
    limit: number;
    searchText: string;
    sortBy: SortBy;
    sortDir: SortDir;
};

export interface AttributesResult {
    data: Array<Attribute>;
    meta: {
        offset: number;
        limit: number;
        searchText: string;
        sortBy: SortBy;
        sortDir: SortDir;
        hasNextPage: boolean;
    };
}

export const QUERY_KEY_ATTRIBUTES = ['Attributes'];

const fetchAttributes = async (params: GetAttributesQueryParams): Promise<AttributesResult> => {
    const { data } = await apiClient.get(`/attributes`, {
        params
    });
    return data;
};

export const useGetAttributes = (params: GetAttributesQueryParams) => {
    return useInfiniteQuery<AttributesResult, Error>({
        queryKey: [QUERY_KEY_ATTRIBUTES, { ...params }],
        queryFn: async ({ pageParam }) =>
            fetchAttributes({ ...params, offset: pageParam as number }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.meta.hasNextPage ? lastPage.meta.offset + lastPage.data.length : undefined
    });
};
