import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box, Typography, Rating } from '@mui/material';
import { fetchRestaurantById } from '../redux/slice/restaurantSlice';
import CardCarousel from '../components/CardCarousel';
import '../styles/restaurantDetail.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const restaurant = useSelector((state) => state.restaurant.restaurant);
    const status = useSelector((state) => state.restaurant.status);
    const [showContent, setShowContent] = useState(false);

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
                    text: 'Read Article'
                }))} carouselId="articles" />
            ) : (
                <p>No articles available.</p>
            )}
        </div>
    );
};

export default RestaurantDetail;
