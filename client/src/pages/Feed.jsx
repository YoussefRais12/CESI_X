import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAllRestaurants, fetchRestaurantsByCategory } from '../redux/slice/restaurantSlice';
import LoadingScreen from '../components/LoadingScreen';
import { Box, Typography } from '@mui/material';
import CategorySelector from '../components/CategorySelector'; // Import CategorySelector
import GridDisplay from '../components/GridDisplay'; // Import GridDisplay
import '../styles/feed.css';
import '../styles/categorySelector.css'; // Import the CSS file

const Feed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const restaurants = useSelector((state) => state.restaurant.restaurants);
    const status = useSelector((state) => state.restaurant.status);
    // ************************** lang section ************************** //
    const [languageData, setLanguageData] = useState({});
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get('lang') || 'fr'; // Default language to 'fr'
    useEffect(() => {
        dispatch(fetchAllRestaurants());
        import(`../lang/${lang}.json`)
            .then((data) => {
                setLanguageData(data);
            })
            .catch((error) => {
                console.error("Let's try again buddy:", error);
            });
    }, [lang, dispatch]);
  
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
                    {languageData.error || "No restaurants found for the selected category"}
                </Typography>
            </div>
        );
    }

    const items = generateItems(restaurants);

    return (
        <div className="feed-container fade-in">
            <CategorySelector onSelectCategory={handleCategoryChange} />
<<<<<<< HEAD
            <GridDisplay items={items} title="Discover More" />
=======
            {/* <h2 className='carousel-title'>Commandez de nouveau</h2> */}
            {/* <Carousel items={items1} carouselId="carousel1" /> */}
            <h2 className='carousel-title'>{ languageData.discover|| "Discover More"} </h2>
            <CardCarousel items={items1} carouselId="cardcarousel1" className="cardcarousel-container" />
            <CardCarousel items={items2} carouselId="cardcarousel2" className="cardcarousel-container" />
>>>>>>> df23409e8d389f46b462e2476fea6a9cf2608898
        </div>
    );
};

export default Feed;
