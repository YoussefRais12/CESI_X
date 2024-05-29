import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchRestaurantById } from '../redux/slice/restaurantSlice';
import Carousel from '../components/Carousel';
import '../styles/restaurantDetail.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const restaurant = useSelector((state) => state.restaurant.restaurant);
    const status = useSelector((state) => state.restaurant.status);

    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantById(id));
        }
    }, [dispatch, id]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!restaurant) {
        return <div>Restaurant not found</div>;
    }

    return (
        <div className="restaurant-detail-container">
            <h1 className="restaurant-name">{restaurant.name}</h1>
            <p className="restaurant-address">{restaurant.address}</p>

            <h2 className="carousel-title">Menus</h2>
            {restaurant.menus && restaurant.menus.length > 0 ? (
                <Carousel items={restaurant.menus.map(menu => ({
                    id: menu._id,
                    // img: menu.img || 'default-menu-image.png', // Add a default image if none is provided
                    title: menu.name,
                    content: menu.description,
                    color: menu.color || '#d3efda', // Use a default color if none is provided
                    text: 'Explore Menu'
                }))} carouselId="menus" />
            ) : (
                <p>No menus available.</p>
            )}

            <h2 className="carousel-title">Articles</h2>
            {restaurant.articles && restaurant.articles.length > 0 ? (
                <Carousel items={restaurant.articles.map(article => ({
                    id: article._id,
                    // img: article.img || 'default-article-image.png', // Add a default image if none is provided
                    title: article.name,
                    content: article.description,
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
