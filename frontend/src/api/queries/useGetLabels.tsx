import { Dictionary, keyBy } from 'lodash';
import apiClient from '../apiClient';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export type Label = {
    id: string;
    name: string;
};

export type GetLabelsQueryParams = {
    offset: number;
    limit: number;
};

interface LabelsResult {
    data: Array<Label>;
    meta: {
        offset: number;
        limit: number;
        hasNextPage: boolean;
    };
}

const QUERY_KEY = ['Labels'];

const fetchLabels = async (params: GetLabelsQueryParams): Promise<LabelsResult> => {
    const { data } = await apiClient.get<LabelsResult>(`/labels`, {
        params
    });
    return data;
};

export const useGetLabels = (params: GetLabelsQueryParams, requiredIds?: Array<Label['id']>) => {
    const [labelMap, setLabelMap] = useState<Dictionary<Label>>({});

    const labels = useInfiniteQuery<LabelsResult, Error>({
        queryKey: [QUERY_KEY, { ...params }],
        queryFn: async ({ pageParam }) => fetchLabels({ ...params, offset: pageParam as number }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.meta.hasNextPage ? lastPage.meta.offset + lastPage.data.length : undefined
    });

    useEffect(() => {
        if (!labels.data) {
            return;
        }
        // Combine all label pages into one map
        const allLabels = labels.data.pages.flatMap((page) => page.data);
        setLabelMap(keyBy(allLabels, (item) => item.id));
    }, [labels.data]);

    useEffect(() => {
        // Fetch more labels if necessary
        const fetchLabelsIfNeeded = async () => {
            if (!requiredIds || !Object.keys(labelMap).length) {
                return;
            }
            // const requiredIds = uniq(attributes.data.pages.flatMap(page => page.data).map(attr => attr.requiredIds).flat());
            if (
                requiredIds.some((labelId) => !labelMap[labelId]) &&
                labels.hasNextPage &&
                !labels.isFetchingNextPage
            ) {
                await labels.fetchNextPage();
                return;
            }
        };

        fetchLabelsIfNeeded();
    }, [requiredIds, labelMap, labels]);

    return labels;
};
