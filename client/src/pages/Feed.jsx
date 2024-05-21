import React from 'react';
// core version + navigation, pagination modules:
import Swiper from 'swiper';
import {Navigation, Pagination} from 'swiper/modules';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/feed.css';

function Feed() {

    const swiper = new Swiper('.swiper', {
        // configure Swiper to use modules
        modules: [
            Navigation, Pagination
        ],
        // ... other configuration options
    });

    return (
        <div class="swiper">

            <div class="swiper-wrapper">

                <div class="swiper-slide">Slide 1</div>
                <div class="swiper-slide">Slide 2</div>
                <div class="swiper-slide">Slide 3</div>
            
            </div>

            <div class="swiper-pagination"></div>

            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>

            <div class="swiper-scrollbar"></div>
        </div>
    );
}

export default Feed;
