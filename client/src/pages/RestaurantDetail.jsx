import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchRestaurantById, updateRestaurant, uploadRestaurantImage } from '../redux/slice/restaurantSlice';
import { updateArticle, addArticle, deleteArticle, fetchArticlesByRestaurantId } from '../redux/slice/articleSlice';
import { fetchMenusByRestaurantId, createMenu } from '../redux/slice/menuSlice';
import CardCarousel from '../components/CardCarousel';
import ArticleDialog from '../components/ArticleDialog';
import ViewArticleDialog from '../components/ViewArticleDialog';
import ViewMenuDialog from '../components/ViewMenuDialog';
import RestaurantInfo from '../components/RestaurantInfo';
import LoadingScreen from '../components/LoadingScreen';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications
import '../styles/restaurantDetail.css';
import { TailSpin } from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

const RestaurantDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const restaurant = useSelector((state) => state.restaurant.restaurant);
    const status = useSelector((state) => state.restaurant.status);
    const user = useSelector((state) => state.user?.user);
    const articles = useSelector((state) => state.article.restaurantArticles);
    const menus = useSelector((state) => state.menu.menus);
    const notifier = new AWN();
    const [showContent, setShowContent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [viewArticleMode, setViewArticleMode] = useState(false);
    const [editArticleMode, setEditArticleMode] = useState(false);
    const [deleteArticleMode, setDeleteArticleMode] = useState(false);
    const [createArticleMode, setCreateArticleMode] = useState(false);
    const [createMenuMode, setCreateMenuMode] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [viewMenuMode, setViewMenuMode] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
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
    const [newMenuData, setNewMenuData] = useState({
        name: '',
        description: '',
        price: '',
        articles: []
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantById(id));
            dispatch(fetchMenusByRestaurantId(id));
            dispatch(fetchArticlesByRestaurantId(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (status === 'succeeded' || status === 'failed') {
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

    useEffect(() => {
        document.body.classList.add('fade-in');
    }, []);

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

    const handleNewMenuInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenuData({
            ...newMenuData,
            [name]: value
        });
    };

    const handleNewMenuArticleChange = (e) => {
        const { value } = e.target;
        setNewMenuData({
            ...newMenuData,
            articles: value
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('img', file);
        setIsUploading(true);

        dispatch(uploadRestaurantImage({ id: restaurant._id, formData }))
            .unwrap()
            .then((response) => {
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Image uploaded successfully!');
                    setIsUploading(false);
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
                setIsUploading(false);
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

        dispatch(updateArticle({ id: selectedArticle.id, articleData: articleFormData }))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
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
            name: selectedArticle.name,
            price: selectedArticle.price.replace(' €', ''), // Remove the Euro symbol for editing
            description: selectedArticle.description,
            category: selectedArticle.category || ''
        });
        setViewArticleMode(false);
        setEditArticleMode(true);
    };

    const handleAddToCart = () => {
        notifier.success('Article added to cart!');
    };

    const handleCreateArticle = () => {
        if (!articleFormData.name || !articleFormData.price || !articleFormData.description || !articleFormData.category) {
            notifier.alert('Please fill in all fields to add the article.');
            return;
        }

        setIsSaving(true);

        dispatch(addArticle({ ...articleFormData, restaurantId: restaurant._id }))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Article added successfully!');
                    setCreateArticleMode(false);
                    setArticleFormData({
                        name: '',
                        price: '',
                        description: '',
                        category: ''
                    });
                    dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleDeleteArticle = () => {
        setIsSaving(true);

        dispatch(deleteArticle(selectedArticle.id))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                notifier.success('Article deleted successfully!');
                setDeleteArticleMode(false);
                setSelectedArticle(null);
                dispatch(fetchRestaurantById(id)); // Refetch the restaurant details to get the latest updates
            })
            .catch((error) => {
                setIsSaving(false);
                console.error('Error:', error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    const handleViewMenu = (menu) => {
        setSelectedMenu(menu);
        setViewMenuMode(true);
    };

    const handleCreateMenu = () => {
        if (!newMenuData.name || !newMenuData.price || !newMenuData.description || newMenuData.articles.length === 0) {
            notifier.alert('Please fill in all fields to create a menu.');
            return;
        }

        setIsSaving(true);

        const formattedPrice = parseFloat(newMenuData.price);
        const newMenu = { ...newMenuData, price: formattedPrice, restaurantId: restaurant._id };
        dispatch(createMenu(newMenu))
            .unwrap()
            .then((response) => {
                setIsSaving(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Menu created successfully!');
                    setCreateMenuMode(false);
                    setNewMenuData({
                        name: '',
                        description: '',
                        price: '',
                        articles: []
                    });
                    document.body.classList.remove('fade-in');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch((error) => {
                setIsSaving(false);
                console.error(error);
                notifier.alert('An unexpected error occurred. Please try again.');
            });
    };

    if (status === 'loading' || isSaving) {
        return <LoadingScreen />;
    }

    if (!restaurant) {
        return <div>Restaurant not found</div>;
    }

    const averageRating = restaurant.ratings && restaurant.ratings.length > 0
        ? (restaurant.ratings.reduce((acc, rating) => acc + rating, 0) / restaurant.ratings.length).toFixed(1)
        : 0;

    return (
        <div className="restaurant-detail-container fade-in">
            {editMode ? (
                <Dialog open={editMode} onClose={() => setEditMode(false)}>
                    <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Edit Restaurant
                        <IconButton onClick={() => setEditMode(false)}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSaveChanges} color="primary">Save</Button>
                        <Button onClick={() => setEditMode(false)} color="secondary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <RestaurantInfo
                    restaurant={restaurant}
                    user={user}
                    averageRating={averageRating}
                    onEdit={() => setEditMode(true)}
                    onCreateArticle={() => setCreateArticleMode(true)}
                    onCreateMenu={() => setCreateMenuMode(true)} // Add this line
                />
            )}

            <div className="profile-image-container">
                {isUploading ? (
                    <div className="loader-container">
                        <TailSpin color="#007bff" height={40} width={40} />
                    </div>
                ) : (
                    <>
                        <img src={restaurant.img} alt="Restaurant" className="profile-img" />
                        <label htmlFor="upload-img" className="camera-icon">
                            <FontAwesomeIcon icon={faCamera} />
                        </label>
                        <input
                            type="file"
                            id="upload-img"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                        />
                    </>
                )}
            </div>

            <h2 className="carousel-title">Menus</h2>
            {restaurant.menus && restaurant.menus.length > 0 ? (
                <CardCarousel items={restaurant.menus.map(menu => ({
                    id: menu._id,
                    img: menu.img || '/default-article-image.png',
                    title: menu.name,
                    price: `${menu.price} €`,
                    description: menu.description,
                    articles: menu.articles
                }))} carouselId="menus" onCardClick={handleViewMenu} />
            ) : (
                <p>No menus available.</p>
            )}

            <h2 className="carousel-title">Articles</h2>
            {restaurant.articles && restaurant.articles.length > 0 ? (
                <CardCarousel items={restaurant.articles.map(article => ({
                    id: article._id,
                    img: article.img || '/default-article-image.png',
                    title: article.name,
                    content: article.description,
                    price: `${article.price} €`,
                    color: article.color || '#e3f1f8',
                    text: 'Read Article',
                    link: '',
                    category: article.category
                }))} carouselId="articles" onCardClick={handleViewArticle} />
            ) : (
                <p>No articles available.</p>
            )}

            {selectedArticle && (
                <ViewArticleDialog
                    open={viewArticleMode}
                    onClose={() => setViewArticleMode(false)}
                    article={selectedArticle}
                    onEdit={handleEditArticle}
                    onDelete={() => setDeleteArticleMode(true)}
                    onAddToCart={handleAddToCart}
                    user={user}
                    restaurant={restaurant}
                />
            )}

            {editArticleMode && selectedArticle && (
                <ArticleDialog
                    open={editArticleMode}
                    onClose={() => setEditArticleMode(false)}
                    title="Edit Article"
                    formData={articleFormData}
                    onInputChange={handleArticleInputChange}
                    onSave={handleSaveArticleChanges}
                    onCancel={() => setEditArticleMode(false)}
                />
            )}

            {createArticleMode && (
                <ArticleDialog
                    open={createArticleMode}
                    onClose={() => setCreateArticleMode(false)}
                    title="Add Article"
                    formData={articleFormData}
                    onInputChange={handleArticleInputChange}
                    onSave={handleCreateArticle}
                    onCancel={() => setCreateArticleMode(false)}
                />
            )}

            {deleteArticleMode && (
                <Dialog open={deleteArticleMode} onClose={() => setDeleteArticleMode(false)}>
                    <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Confirm Delete
                        <IconButton onClick={() => setDeleteArticleMode(false)}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this article?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteArticle} color="error">Delete</Button>
                        <Button onClick={() => setDeleteArticleMode(false)} color="secondary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}

            {selectedMenu && (
                <ViewMenuDialog
                    open={viewMenuMode}
                    onClose={() => setViewMenuMode(false)}
                    menu={selectedMenu}
                    onAddToCart={handleAddToCart}
                    user={user}
                    restaurant={restaurant}
                />
            )}

            <Dialog open={createMenuMode} onClose={() => setCreateMenuMode(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Create Menu
                    <IconButton onClick={() => setCreateMenuMode(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2 }}>
                        <TextField
                            label="Name"
                            name="name"
                            value={newMenuData.name}
                            onChange={handleNewMenuInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={newMenuData.description}
                            onChange={handleNewMenuInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Price"
                            name="price"
                            value={newMenuData.price}
                            onChange={handleNewMenuInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="articles-label">Articles</InputLabel>
                            <Select
                                labelId="articles-label"
                                name="articles"
                                multiple
                                value={newMenuData.articles}
                                onChange={handleNewMenuArticleChange}
                                renderValue={(selected) => selected.map(id => {
                                    const article = articles.find(a => a._id === id);
                                    return article ? article.name : id;
                                }).join(', ')}
                            >
                                {articles.map((article) => (
                                    <MenuItem key={article._id} value={article._id}>
                                        {article.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateMenu} color="primary">Create</Button>
                    <Button onClick={() => setCreateMenuMode(false)} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RestaurantDetail;
