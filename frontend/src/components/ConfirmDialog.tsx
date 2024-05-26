import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConfirmDialogProps {
    title: string;
    text: string;
    options: DialogOption[];
    isOpen: boolean;
    onClose: () => any;
    onConfirm: (option: DialogOption) => any;
}

export type DialogOption = {
    id: string | number;
    name: string;
};

export default function ConfirmDialog({
    isOpen,
    title,
    text,
    options,
    onClose,
    onConfirm
}: ConfirmDialogProps) {
    return (
        <React.Fragment>
            <Dialog
                open={isOpen}
                onClose={onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {options.map((option) => (
                        <Button key={option.id} onClick={() => onConfirm(option)}>
                            {option.name}
                        </Button>
                    ))}
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
