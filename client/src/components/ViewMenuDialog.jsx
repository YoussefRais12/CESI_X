import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Box, Typography, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticlesByIds } from '../redux/slice/articleSlice';
import { deleteMenu, updateMenu } from '../redux/slice/menuSlice';

const ViewMenuDialog = ({ open, onClose, menu, onAddToCart, user, restaurant }) => {
    const dispatch = useDispatch();
    const articles = useSelector((state) => state.article.articles);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [menuData, setMenuData] = useState({
        name: menu?.name || '',
        description: menu?.description || '',
        price: menu?.price || '',
        articles: menu?.articles || []
    });

    const [editMenuData, setEditMenuData] = useState({
        name: menu?.name || '',
        description: menu?.description || '',
        price: menu?.price || ''
    });

    useEffect(() => {
        if (menu && menu.articles && menu.articles.length > 0) {
            dispatch(fetchArticlesByIds(menu.articles));
        }
    }, [menu, dispatch]);

    useEffect(() => {
        if (menu) {
            setMenuData({
                name: menu.name,
                description: menu.description,
                price: menu.price,
                articles: menu.articles
            });

            setEditMenuData({
                name: menu.title,
                description: menu.description,
                price: menu.price.toString().replace(' €', '')
            });
            console.log('Menu data:', menu);
        }
    }, [menu]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditMenuData({
            ...editMenuData,
            [name]: value
        });
    };

    const handleSaveChanges = () => {
        const formattedPrice = parseFloat(editMenuData.price); // Ensure the price is a number
        const updatedMenuData = { ...editMenuData, price: formattedPrice };
        console.log("Saving changes with updatedMenuData:", updatedMenuData);
        dispatch(updateMenu({ id: menu.id, menuData: updatedMenuData }))
            .unwrap()
            .then(() => {
                setEditMode(false);
                onClose(); // Close the dialog after saving
                window.location.reload();
            })
            .catch((error) => {
                console.error('Failed to update menu:', error);
                if (error.response && error.response.data) {
                    console.error('Backend error:', error.response.data);
                }
            });
    };

    const handleDeleteMenu = () => {
        dispatch(deleteMenu(menu.id))
            .unwrap()
            .then(() => {
                setConfirmDelete(false);
                onClose();
                window.location.reload();
            })
            .catch((error) => {
                console.error('Failed to delete menu:', error);
            });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Menu Details
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2 }}>
                        {editMode ? (
                            <>
                                <TextField
                                    label="Name"
                                    name="name"
                                    value={editMenuData.name}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Description"
                                    name="description"
                                    value={editMenuData.description}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Price"
                                    name="price"
                                    value={editMenuData.price}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>{menu?.name}</Typography>
                                <Typography variant="body1" sx={{ marginBottom: 2 }}>Price: {menu?.price} </Typography>
                                <Typography variant="body1" sx={{ marginBottom: 2 }}>{menu?.description}</Typography>
                                <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 'bold' }}>Articles:</Typography>
                                {articles && articles.length > 0 ? (
                                    articles.map((article) => (
                                        <Box key={article._id} sx={{ marginBottom: 2, padding: 2, border: '1px solid #e0e0e0', borderRadius: 1, width: '100%' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Name: {article.name}</Typography>
                                            <Typography variant="body2">Price: {article.price} €</Typography>
                                            <Typography variant="body2">Description: {article.description}</Typography>
                                            <Typography variant="body2">Category: {article.category}</Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2">No articles available for this menu.</Typography>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    {editMode ? (
                        <>
                            <Button onClick={handleSaveChanges} color="primary">Save</Button>
                            <Button onClick={() => setEditMode(false)} color="secondary">Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={onAddToCart} color="primary">Add to Cart</Button>
                            {user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId && (
                                <>
                                    <Button onClick={() => setEditMode(true)} color="primary">Edit Menu</Button>
                                    <Button onClick={() => setConfirmDelete(true)} color="error">Delete Menu</Button>
                                </>
                            )}
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
            >
                <DialogTitle>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this menu?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleDeleteMenu} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ViewMenuDialog;
