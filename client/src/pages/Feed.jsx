import React from 'react';
import Carousel from '../components/Carousel'; // Adjust the path as necessary

const items = [
    {
        id: 1,
        img: require('../styles/assets/carousel1.png'), // Use require
        title: 'Nouveaux restos ⭐',
        content: 'La fine sélection à découvrir',
        color: '#d3efda' // Add color property
    },
    {
        id: 2,
        img: 'assets/images/SarayaAlBahar.png',
        title: 'Charming & Peaceful',
        content: 'Discover Saraya Al Bahar',
        color: '#40754a' // Add color property
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

const Feed = () => {
    return (
        <div>
            <Carousel items={items} />
        </div>
    );
};

export default Feed;
