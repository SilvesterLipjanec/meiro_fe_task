import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useGetAttribute } from '../api/queries/useGetAttribute';
import { useEffect, useState } from 'react';
import { useDeleteAttribute } from '../api/mutations/useDeleteAttribute';
import { GetLabelsQueryParams, Label, useGetLabels } from '../api/queries/useGetLabels';
import { Dictionary, keyBy } from 'lodash';
import {
    Container,
    TextField,
    FormControl,
    InputLabel,
    Box,
    Chip,
    OutlinedInput,
    Select,
    Button,
    Stack,
    CircularProgress
} from '@mui/material';
import ConfirmDialog, { DialogOption } from './ConfirmDialog';
import LoaderOverlay from './LoaderOverlay';

export default function AttributeDetail() {
    const { id } = useParams();

    const [labelsParams, setLabelsParams] = useState<GetLabelsQueryParams>({
        offset: 0,
        limit: 10
    });
    const [deleteId, setDeleteId] = useState<Label['id'] | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const attribute = useGetAttribute(id);
    const deleteAttribute = useDeleteAttribute();

    const [labelMap, setLabelMap] = useState<Dictionary<Label>>({});
    const [requiredLabels, setRequiredLabels] = useState<Array<Label['id']>>();

    const labels = useGetLabels(labelsParams, requiredLabels);

    const handleBack = () => {
        navigate('/attributes', {
            state: location.state
        });
    };

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
        if (!attribute.data) {
            return;
        }
        setRequiredLabels(attribute.data.data.labelIds);
    }, [attribute.data]);

    const handleDelete = (id: Label['id']) => {
        if (!id) {
            return;
        }
        deleteAttribute.mutate({ id, params: location.state.params });
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const id = attribute.data?.data.id;
        if (!id) {
            return;
        }
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
                handleBack();

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
            <Box sx={{ margin: '20px 0' }}>
                <Button variant="outlined" onClick={handleBack}>
                    back
                </Button>
            </Box>

            {attribute.status === 'pending' ? (
                <LoaderOverlay></LoaderOverlay>
            ) : attribute.status === 'error' ? (
                <span>Error: {attribute.error.message}</span>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '1000px'
                        }}
                    >
                        <Stack spacing={3}>
                            <h2>Attribute detail</h2>

                            <TextField
                                disabled={true}
                                value={attribute.data.data.name}
                                label="Name"
                                variant="outlined"
                                fullWidth
                            />
                            {labels.status === 'pending' ? (
                                <CircularProgress />
                            ) : labels.status === 'error' ? (
                                <span>Error: {labels.error.message}</span>
                            ) : (
                                <FormControl>
                                    <InputLabel id="demo-multiple-chip-label">Labels</InputLabel>
                                    <Select
                                        labelId="demo-multiple-chip-label"
                                        id="demo-multiple-chip"
                                        multiple
                                        value={attribute.data.data.labelIds}
                                        input={
                                            <OutlinedInput id="select-multiple-chip" label="Chip" />
                                        }
                                        renderValue={(selected) => (
                                            <Box
                                                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                                            >
                                                {selected.map((value) => (
                                                    <Chip
                                                        key={value}
                                                        label={labelMap[value]?.name}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                        disabled={true}
                                    ></Select>
                                </FormControl>
                            )}
                            <Box sx={{ display: 'flex' }}>
                                <Button
                                    onClick={(e) => handleDeleteClick(e)}
                                    color="error"
                                    variant="contained"
                                >
                                    delete
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </>
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
