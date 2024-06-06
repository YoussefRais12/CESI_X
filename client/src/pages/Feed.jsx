import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import CardCarousel from '../components/CardCarousel';
import { fetchAllRestaurants, fetchRestaurantsByCategory } from '../redux/slice/restaurantSlice';
import LoadingScreen from '../components/LoadingScreen';
import { Box, Typography } from '@mui/material';
import CategorySelector from '../components/CategorySelector'; // Import CategorySelector
import '../styles/feed.css';
import '../styles/categorySelector.css'; // Import the CSS file

const Feed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const restaurants = useSelector((state) => state.restaurant.restaurants);
    const status = useSelector((state) => state.restaurant.status);
    const [category, setCategory] = useState('All');

    useEffect(() => {
        if (category === 'All') {
            dispatch(fetchAllRestaurants());
        } else {
            dispatch(fetchRestaurantsByCategory(category));
        }
    }, [category, dispatch]);

    const handleCategoryChange = (category) => {
        setCategory(category);
    };

    const generateItems = (restaurants) => {
        return restaurants.map((restaurant, index) => ({
            id: restaurant._id,
            img: restaurant.img || '/default-article-image.png',
            title: restaurant.name,
            content: restaurant.address,
            price: restaurant.address,
            color: ['#d3efda', '#FEE4B6', '#4c526c', '#955979', '#090702'][index % 5],
            link: `/restaurant/${restaurant._id}`,
            text: 'En exclusivité sur Cesi Eats 🔥',
        }));
    };

    if (status === "loading") {
        return <LoadingScreen />;
    }

    if (restaurants.length === 0) {
        return (
            <div className="feed-container fade-in">
                <CategorySelector onSelectCategory={handleCategoryChange} />
                <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
                    No restaurants found for the selected category.
                </Typography>
            </div>
        );
    }

    const items1 = generateItems(restaurants.slice(0, 5));
    const items2 = generateItems(restaurants.slice(5, 10));

    return (
        <div className="feed-container fade-in">
            <CategorySelector onSelectCategory={handleCategoryChange} />
            {/* <h2 className='carousel-title'>Commandez de nouveau</h2> */}
            {/* <Carousel items={items1} carouselId="carousel1" /> */}
            <h2 className='carousel-title'>Discover More</h2>
            <CardCarousel items={items1} carouselId="cardcarousel1" className="cardcarousel-container" />
            <CardCarousel items={items2} carouselId="cardcarousel2" className="cardcarousel-container" />
        </div>
    );
};

export default Feed;
