import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingScreen = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
        }}
    >
        <CircularProgress />
    </Box>
);

export default LoadingScreen;
