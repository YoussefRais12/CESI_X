import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/carousel.css'; // Adjust the path as necessary

const Carousel = ({ items }) => {
    const [index, setIndex] = useState(0);

    return (
        <div className="swiper-container">
            <Swiper
                spaceBetween={20} /* Add space between slides */
                pagination={{
                    clickable: true,
                }}
                onSlideChange={(swiper) => setIndex(swiper.activeIndex)}
                slidesPerView={3} /* Ensure 3 slides per view */
                className="mySwiper"
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id} className="swiper-slide">
                        <div
                            className="slide-content"
                            onClick={() => window.location.href = item.link}
                            style={{ backgroundColor: item.color }} // Use color property
                        >
                            <div className="text-content">
                                <div className="title">{item.title}</div>
                                <div className="content">{item.content}</div>
                            </div>
                            <div className="image-right">
                                <img src={item.img} alt={item.title} />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="swiper-pagination"></div>
        </div>
    );
};

export default Carousel;
