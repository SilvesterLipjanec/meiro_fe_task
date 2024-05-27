import {
    GetAttributesQueryParams,
    SortBy,
    useGetAttributes
} from '../api/queries/useGetAttributes';
import { useInView } from 'react-intersection-observer';
import React, { MouseEventHandler, ReactEventHandler, useEffect, useMemo } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography
} from '@mui/material';
import { useState, Fragment } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { GetLabelsQueryParams, Label, useGetLabels } from '../api/queries/useGetLabels';
import { Dictionary, keyBy, sortBy, uniq } from 'lodash';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDeleteAttribute } from '../api/mutations/useDeleteAttribute';
import ConfirmDialog from './ConfirmDialog';
import { DialogOption } from './ConfirmDialog';
import LoaderOverlay from './LoaderOverlay';

export default function Attributes() {
    const location = useLocation();
    const navigate = useNavigate();

    const [search, setSearch] = useState<string>(location.state?.params.searchText || '');

    const [attributeParams, setAttributeParams] = useState<GetAttributesQueryParams>(
        location.state?.params || {
            offset: 0,
            limit: 10,
            searchText: '',
            sortBy: 'name',
            sortDir: 'asc'
        }
    );

    const [labelsParams, setLabelsParams] = useState<GetLabelsQueryParams>({
        offset: 0,
        limit: 10
    });

    const [labelMap, setLabelMap] = useState<Dictionary<Label>>({});
    const [requiredLabels, setRequiredLabels] = useState<Array<Label['id']>>();
    const [deleteId, setDeleteId] = useState<Label['id'] | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const { ref, inView } = useInView();

    const attributes = useGetAttributes(attributeParams);

    const labels = useGetLabels(labelsParams, requiredLabels);

    const deleteAttribute = useDeleteAttribute();

    useEffect(() => {
        if (inView) {
            attributes.fetchNextPage();
        }
    }, [attributes.fetchNextPage, inView]);

    useEffect(() => {
        if (!labels.data) {
            return;
        }
        // Combine all label pages into one map
        setLabelMap(
            keyBy(
                labels.data.pages.flatMap((page) => page.data),
                (item) => item.id
            )
        );
    }, [labels.data]);

    useEffect(() => {
        if (!attributes.data) {
            return;
        }
        setRequiredLabels(
            uniq(
                attributes.data.pages
                    .flatMap((page) => page.data)
                    .map((attr) => attr.labelIds)
                    .flat()
            )
        );
    }, [attributes.data]);

    useEffect(() => {
        setAttributeParams({
            ...attributeParams,
            searchText: debouncedSearch
        });
    }, [debouncedSearch]);

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    const handleSort = (column: SortBy) => {
        const isAsc = attributeParams.sortBy === column && attributeParams.sortDir === 'asc';
        setAttributeParams({ ...attributeParams, sortBy: column, sortDir: isAsc ? 'desc' : 'asc' });
    };

    function handleRowClick(id: Label['id'], e: React.MouseEvent) {
        e.stopPropagation();
        navigate(`/attributes/${id}`, { state: { params: attributeParams } });
    }

    const handleDelete = (id: Label['id']) => {
        if (!id) {
            return;
        }
        deleteAttribute.mutate({ id, params: attributeParams });
    };

    const handleDeleteClick = (e: React.MouseEvent, id: Label['id']) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const handleDialogConfirm = (option: DialogOption) => {
        switch (option.id) {
            case 0: {
                if (!deleteId) {
                    return;
                }
                handleDelete(deleteId);
                handleDialogClose();
                break;
            }
            default: {
                handleDialogClose();
            }
        }
    };

    const handleDialogClose = () => setDeleteId(null);

    return (
        <Container>
            <h2>Attributes</h2>
            <TextField
                id="standard-basic"
                label="Search"
                variant="standard"
                value={search}
                onChange={handleSearchChange}
            />
            {attributes.status === 'pending' ? (
                <LoaderOverlay></LoaderOverlay>
            ) : attributes.status === 'error' ? (
                <Alert severity="error">{attributes.error.message}</Alert>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <TableSortLabel
                                        active={attributeParams.sortBy === 'name'}
                                        direction={
                                            attributeParams.sortBy === 'name'
                                                ? attributeParams.sortDir
                                                : 'asc'
                                        }
                                        onClick={() => handleSort('name')}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Labels</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={attributeParams.sortBy === 'createdAt'}
                                        direction={
                                            attributeParams.sortBy === 'createdAt'
                                                ? attributeParams.sortDir
                                                : 'asc'
                                        }
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        Created at
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attributes.data.pages.map((page) => (
                                <Fragment key={page.meta.offset}>
                                    {page.data.map((attribute) => (
                                        <TableRow
                                            sx={{ cursor: 'pointer ' }}
                                            key={attribute.id}
                                            onClick={(e) => handleRowClick(attribute.id, e)}
                                        >
                                            <TableCell>{attribute.name}</TableCell>
                                            <TableCell>
                                                {labels.status === 'pending' ? (
                                                    <CircularProgress />
                                                ) : labels.status === 'error' ? (
                                                    <span>Error: {labels.error.message}</span>
                                                ) : (
                                                    attribute.labelIds.map((labelId) => {
                                                        var label = labelMap[labelId];
                                                        return (
                                                            label && (
                                                                <Chip
                                                                    key={label.id}
                                                                    label={label.name}
                                                                />
                                                            )
                                                        );
                                                    })
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(attribute.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    color="error"
                                                    onClick={(e) =>
                                                        handleDeleteClick(e, attribute.id)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                    <Box sx={{ textAlign: 'center', margin: '20px' }}>
                        <Typography ref={ref}>
                            {attributes.isFetchingNextPage ? (
                                <CircularProgress />
                            ) : (
                                !attributes.hasNextPage && 'Nothing more to load'
                            )}
                            {attributes.isFetching && !attributes.isFetchingNextPage
                                ? 'Background Updating...'
                                : null}
                        </Typography>
                    </Box>
                    {attributes.isLoading && <CircularProgress />}
                </TableContainer>
            )}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={handleDialogClose}
                title={'Alert'}
                text={'Are you sure you want to delete this attribute?'}
                options={[
                    {
                        id: 0,
                        name: 'Yes'
                    },
                    {
                        id: 1,
                        name: 'No'
                    }
                ]}
                onConfirm={handleDialogConfirm}
            />
        </Container>
    );
}
