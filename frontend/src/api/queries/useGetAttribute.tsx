import apiClient from '../apiClient';
import { useQuery } from '@tanstack/react-query';
import { Label } from './useGetLabels';

export type Attribute = {
    id: string;
    name: string;
    createdAt: string;
    labelIds: Array<Label['id']>;
    deleted: boolean;
};

export interface AttributeResult {
    data: Attribute;
}

const QUERY_KEY = ['Attribute'];

const fetchAttribute = async (id?: Label['id']): Promise<AttributeResult> => {
    const { data } = await apiClient.get(`/attributes/${id}`);
    return data;
};

export const useGetAttribute = (id?: Label['id']) => {
    return useQuery<AttributeResult, Error>({
        queryKey: [QUERY_KEY, { id }],
        queryFn: () => fetchAttribute(id),
        enabled: id != null
    });
};
