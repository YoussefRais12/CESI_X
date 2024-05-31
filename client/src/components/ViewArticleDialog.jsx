import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ViewArticleDialog = ({ open, onClose, article, onEdit, onDelete, onAddToCart, user, restaurant }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Article Details
            <IconButton onClick={onClose}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', marginBottom: 2 }}>
                    <img src={article.img || '/default-article-image.png'} alt={article.name} style={{ width: '100%', borderRadius: '10px' }} />
                </Box>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body1">Price: {article.price}</Typography>
                <Typography variant="body1">{article.content}</Typography>
                <Typography variant="body1">Category: {article.category}</Typography>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onAddToCart} color="primary">Add to Cart</Button>
            {user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId && (
                <>
                    <Button onClick={onEdit} color="secondary">Edit</Button>
                    <Button onClick={onDelete} color="error">Delete</Button>
                </>
            )}
        </DialogActions>
    </Dialog>
);

export default ViewArticleDialog;
