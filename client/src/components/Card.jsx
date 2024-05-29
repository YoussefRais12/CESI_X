import React from 'react';
import { Box, Typography } from '@mui/material';
import '../styles/card.css'; // Adjust the path as necessary

const Card = ({ img, title, description }) => {
    return (
        <>
             <Box className="card-container">
                <img src={img} alt={title} className="card-image" />
             </Box>    
             <Typography variant="h6" className="card-title">{title}</Typography>
             <Typography variant="body2" className="card-description">{description}</Typography>
        </>
    );
};

export default Card;
