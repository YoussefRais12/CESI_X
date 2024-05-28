import React from 'react';
import Carousel from '../components/Carousel'; // Adjust the path as necessary
import '../styles/feed.css';

const items1 = [
    {
        id: 1,
        img: require('../styles/assets/carousel1.png'), // Use require
        title: 'Nouveaux restos ⭐',
        content: 'La fine sélection à découvrir',
        color: '#d3efda', // Add color property
        text: 'En exclusivité sur Cesi Eats 🔥' // Add text property
    },
    {
        id: 2,
        img: require('../styles/assets/carousel2.png'),
        title: 'Charming & Peaceful',
        content: 'Discover Saraya Al Bahar',
        color: '#FEE4B6', // Add color property
        text: 'Je fonce 🚀 ->' // Add text property
    },
    {
        id: 3,
        img: 'assets/images/SarayaAlBuhairat.png',
        title: 'Inspiring designs',
        content: 'Discover Saraya Al Buhairat',
        color: '#4c526c' // Add color property
    },
    // Add more items as needed
    {
        id: 4,
        img: 'assets/images/SarayaAlBuhairat.png',
        title: 'Modern Living',
        content: 'Discover Modern Living',
        color: '#955979' // Add color property
    },
    {
        id: 5,
        img: 'assets/images/SarayaAlBuhairat.png',
        title: 'Luxurious Comfort',
        content: 'Discover Luxurious Comfort',
        color: '#090702' // Add color property
    },
];

const items2 = [
    {
        id: 6,
        img: ('../styles/assets/carousel3.png'), // Use require
        title: 'Gourmet Delights',
        content: 'Experience the best cuisine',
        color: '#e3f1f8', // Add color property
        text: 'Taste Now 🍴' // Add text property
    },
    {
        id: 7,
        img: ('../styles/assets/carousel4.png'),
        title: 'Nature Escapes',
        content: 'Explore serene landscapes',
        color: '#dfe7fd', // Add color property
        text: 'Explore 🌍' // Add text property
    },
    {
        id: 8,
        img: 'assets/images/Adventure.png',
        title: 'Adventures Await',
        content: 'Embark on thrilling journeys',
        color: '#ffefd5' // Add color property
    },
    // Add more items as needed
    {
        id: 9,
        img: 'assets/images/UrbanLiving.png',
        title: 'Urban Living',
        content: 'Discover city life',
        color: '#b0e0e6' // Add color property
    },
    {
        id: 10,
        img: 'assets/images/LuxuryTravel.png',
        title: 'Luxury Travel',
        content: 'Travel in style and comfort',
        color: '#e6e6fa' // Add color property
    },
];

const Feed = () => {
    return (
        <div>
            <h2 className='carousel-title'>Commandez de nouveau</h2>
            <Carousel items={items1} carouselId="carousel1" />
            <h2 className='carousel-title'>Discover More</h2>
            <Carousel items={items2} carouselId="carousel2" />
        </div>
    );
};

export default Feed;
