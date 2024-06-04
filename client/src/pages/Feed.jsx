import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import CardCarousel from '../components/CardCarousel'; // Import CardCarousel
import { fetchAllRestaurants } from '../redux/slice/restaurantSlice';
import '../styles/feed.css';

const Feed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const restaurants = useSelector((state) => state.restaurant.restaurants);
    const status = useSelector((state) => state.restaurant.status);

    useEffect(() => {
        dispatch(fetchAllRestaurants());
    }, [dispatch]);

    const generateItems = (restaurants) => {
        return restaurants.map((restaurant, index) => ({
            id: restaurant._id,
            img:   restaurant.img || '/default-article-image.png', // Cycle through carousel images
            title: restaurant.name,
            content: restaurant.address,
            price : restaurant.address,
            color: ['#d3efda', '#FEE4B6', '#4c526c', '#955979', '#090702'][index % 5], // Cycle through colors
            link: `/restaurant/${restaurant._id}`, // Redirect link to restaurant detail page
            text: 'En exclusivité sur Cesi Eats 🔥',
        }));
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    const items1 = generateItems(restaurants.slice(0, 5));
    const items2 = generateItems(restaurants.slice(5, 10));

    return (
        <div className="feed-container">
            <h2 className='carousel-title'>Commandez de nouveau</h2>
            <Carousel items={items1} carouselId="carousel1" />
            <h2 className='carousel-title'>Discover More</h2>
            <CardCarousel items={items1} carouselId="cardcarousel1" className="cardcarousel-container" />
            <CardCarousel items={items2} carouselId="cardcarousel2" className="cardcarousel-container" />
        </div>
    );
};

export default Feed;
