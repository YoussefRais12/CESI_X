import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box, Typography, Rating, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchRestaurantById, updateRestaurant } from '../redux/slice/restaurantSlice';
import { updateArticle } from '../redux/slice/articleSlice'; // Import the updateArticle action
import CardCarousel from '../components/CardCarousel';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications
import '../styles/restaurantDetail.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const restaurant = useSelector((state) => state.restaurant.restaurant);
    const status = useSelector((state) => state.restaurant.status);
    const user = useSelector((state) => state.user?.user);
    const [showContent, setShowContent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [viewArticleMode, setViewArticleMode] = useState(false); // State for viewing articles
    const [editArticleMode, setEditArticleMode] = useState(false); // State for editing articles
    const [selectedArticle, setSelectedArticle] = useState(null); // State for the selected article
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        workingHours: '',
        category: ''
    });
    const [articleFormData, setArticleFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: ''
    });
    const notifier = new AWN();

    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 1000); // Ensure the loading animation is shown for at least 1 second

            return () => clearTimeout(timer);
        }
    }, [status]);

    useEffect(() => {
        if (restaurant) {
            setFormData({
                name: restaurant.name || '',
                address: restaurant.address || '',
                phone: restaurant.phone || '',
                workingHours: restaurant.workingHours || '',
                category: restaurant.category || ''
            });
        }
    }, [restaurant]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleArticleInputChange = (e) => {
        const { name, value } = e.target;
        setArticleFormData({
            ...articleFormData,
            [name]: value
        });
    };

    const handleSaveChanges = () => {
        if (!formData.name || !formData.address || !formData.phone || !formData.workingHours || !formData.category) {
            notifier.alert('Please fill in all fields to update the restaurant.');
            return;
        }

        setIsSaving(true);

        dispatch(updateRestaurant({ id: restaurant._id, ...formData }))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Restaurant updated successfully!');
                    setEditMode(false);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleSaveArticleChanges = () => {
        if (!articleFormData.name || !articleFormData.price || !articleFormData.description || !articleFormData.category) {
            notifier.alert('Please fill in all fields to update the article.');
            return;
        }
    
        setIsSaving(true);
    
        dispatch(updateArticle({ id: selectedArticle.id, articleData: articleFormData}))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                console.log('Response from update:', response); // Log the response to verify
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Article updated successfully!');
                    setEditArticleMode(false);
                    setSelectedArticle(null);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error('Error:', error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };
    
    

    const handleViewArticle = (article) => {
        setSelectedArticle(article);
        setViewArticleMode(true);
    };

    const handleEditArticle = () => {
        setArticleFormData({
            name: selectedArticle.title,
            price: selectedArticle.price.replace(' €', ''), // Remove the Euro symbol for editing
            description: selectedArticle.content,
            category: selectedArticle.category || ''
        });
        setViewArticleMode(false);
        setEditArticleMode(true);
    };

    const handleAddToCart = () => {
        // Add logic to add the article to the cart
        notifier.success('Article added to cart!');
    };

    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!restaurant) {
        return <div>Restaurant not found</div>;
    }

    const averageRating = restaurant.ratings && restaurant.ratings.length > 0
        ? (restaurant.ratings.reduce((acc, rating) => acc + rating, 0) / restaurant.ratings.length).toFixed(1)
        : 0;

    return (
        <div className="restaurant-detail-container">
            {isSaving && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            )}
            {!isSaving && (
                <>
                    {editMode ? (
                        <Box>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Working Hours"
                                name="workingHours"
                                value={formData.workingHours}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                                Save Changes
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)} sx={{ marginLeft: 2 }}>
                                Cancel
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h1" className="restaurant-name">{restaurant.name}</Typography>
                            <Typography variant="body1" className="restaurant-address">Address: {restaurant.address}</Typography>
                            <Rating
                                name="read-only"
                                value={parseFloat(averageRating)}
                                precision={0.1}
                                readOnly
                            />
                            <Typography variant="body1" className="restaurant-phone">Phone: {restaurant.phone}</Typography>
                            <Typography variant="body1" className="restaurant-working-hours">Working Hours: {restaurant.workingHours}</Typography>
                            <Typography variant="body1" className="restaurant-category">Category: {restaurant.category}</Typography>
                            <Box className="restaurant-ratings" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            </Box>
                            {user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId && (
                                <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
                                    Edit Information
                                </Button>
                            )}

                            <h2 className="carousel-title">Menus</h2>
                            {restaurant.menus && restaurant.menus.length > 0 ? (
                                <CardCarousel items={restaurant.menus.map(menu => ({
                                    id: menu._id,
                                    img: menu.img || '/default-article-image.png', // Add a default image if none is provided
                                    title: menu.name,
                                    price: `${menu.price} €`, // Add price if available
                                    color: menu.color || '#d3efda', // Use a default color if none is provided
                                    text: 'Explore Menu'
                                }))} carouselId="menus" />
                            ) : (
                                <p>No menus available.</p>
                            )}

                            <h2 className="carousel-title">Articles</h2>
                            {restaurant.articles && restaurant.articles.length > 0 ? (
                                <CardCarousel items={restaurant.articles.map(article => ({
                                    id: article._id,
                                    img: article.img || '/default-article-image.png', // Add a default image if none is provided
                                    title: article.name,
                                    content: article.description,
                                    price: `${article.price} €`, // Add price
                                    color: article.color || '#e3f1f8', // Use a default color if none is provided
                                    text: 'Read Article',
                                    link: '', // Ensure there's an empty link so the onClick works
                                    category: article.category // Add category field
                                }))} carouselId="articles" onCardClick={handleViewArticle} />
                            ) : (
                                <p>No articles available.</p>
                            )}

                            {selectedArticle && (
                                <Dialog open={viewArticleMode} onClose={() => setViewArticleMode(false)}>
                                    <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Article Details
                                        <IconButton onClick={() => setViewArticleMode(false)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Box sx={{ width: '100%', marginBottom: 2 }}>
                                                <img src={selectedArticle.img || '/default-article-image.png'} alt={selectedArticle.name} style={{ width: '100%', borderRadius: '10px' }} />
                                            </Box>
                                            <Typography variant="h6">{selectedArticle.title}</Typography>
                                            <Typography variant="body1">Price: {selectedArticle.price}</Typography>
                                            <Typography variant="body1">{selectedArticle.content}</Typography>
                                            <Typography variant="body1">Category: {selectedArticle.category}</Typography>
                                        </Box>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleAddToCart} color="primary">Add to Cart</Button>
                                        {user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId && (
                                            <Button onClick={handleEditArticle} color="secondary">Edit</Button>
                                        )}
                                    </DialogActions>
                                </Dialog>
                            )}

                            {editArticleMode && selectedArticle && (
                                <Dialog open={editArticleMode} onClose={() => setEditArticleMode(false)}>
                                    <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Edit Article
                                        <IconButton onClick={() => setEditArticleMode(false)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Box sx={{ width: '100%', marginBottom: 2 }}>
                                                <img src={selectedArticle.img || '/default-article-image.png'} alt={selectedArticle.name} style={{ width: '100%', borderRadius: '10px' }} />
                                            </Box>
                                            <TextField
                                                label="Article Name"
                                                name="name"
                                                value={articleFormData.name}
                                                onChange={handleArticleInputChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Article Price"
                                                name="price"
                                                value={articleFormData.price}
                                                onChange={handleArticleInputChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Article Description"
                                                name="description"
                                                value={articleFormData.description}
                                                onChange={handleArticleInputChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Article Category"
                                                name="category"
                                                value={articleFormData.category}
                                                onChange={handleArticleInputChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                        </Box>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleSaveArticleChanges} color="primary">Save</Button>
                                        <Button onClick={() => setEditArticleMode(false)} color="secondary">Cancel</Button>
                                    </DialogActions>
                                </Dialog>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default RestaurantDetail;
