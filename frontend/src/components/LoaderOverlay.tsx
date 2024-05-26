import { Box, CircularProgress } from '@mui/material';

export default function LoaderOverlay() {
    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <CircularProgress sx={{ position: 'absolute', left: '50%', top: '40%' }} />
        </Box>
    );
}
