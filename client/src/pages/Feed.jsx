import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Carousel from '../components/Carousel';
import CardCarousel from '../components/CardCarousel'; // Import CardCarousel
import { fetchAllRestaurants } from '../redux/slice/restaurantSlice';
import LoadingScreen from '../components/LoadingScreen'; // Import LoadingScreen
import '../styles/feed.css';

const Feed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const restaurants = useSelector((state) => state.restaurant.restaurants);
    const status = useSelector((state) => state.restaurant.status);

    const location = useLocation();
    const [languageData, setLanguageData]= useState({});

    useEffect (() => {
        const searchParams = new URLSearchParams(location.search);
        const lang = searchParams.get("lang") || "fr";
        import(`../lang/${lang}.json`)
          .then((data) => {
            setLanguageData(data);
          })
          .catch((error) => {
            console.error("Let's try again buddy:", error);
          });
      }, [location.search]);


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
        return <LoadingScreen />;
    }

    const items1 = generateItems(restaurants.slice(0, 5));
    const items2 = generateItems(restaurants.slice(5, 10));

    return (
        <div className="feed-container fade-in">
            <h2 className='carousel-title'>{languageData.Commandes || "Commandez de nouveau"}</h2>
            <Carousel items={items1} carouselId="carousel1" />
            <h2 className='carousel-title'>{languageData.discover || "Discover More"} </h2>
            <CardCarousel items={items1} carouselId="cardcarousel1" className="cardcarousel-container" />
            <CardCarousel items={items2} carouselId="cardcarousel2" className="cardcarousel-container" />
        </div>
    );
};

export default Feed;
