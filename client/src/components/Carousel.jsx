import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/carousel.css'; // Adjust the path as necessary

const Carousel = ({ items, carouselId }) => {
    return (
        <div className="carousel-container">
            <div className="carousel-header">
                <h2></h2>
                <div className="carousel-controls">
                    <FontAwesomeIcon icon={faChevronLeft} className={`carousel-control prev-${carouselId}`} />
                    <FontAwesomeIcon icon={faChevronRight} className={`carousel-control next-${carouselId}`} />
                </div>
            </div>
            <Swiper
                spaceBetween={20} // Add space between slides
                pagination={{ clickable: true }}
                navigation={{ nextEl: `.next-${carouselId}`, prevEl: `.prev-${carouselId}` }} // Enable navigation
                slidesPerView={3} // Ensure 3 slides per view
                className="mySwiper"
                modules={[Pagination, Navigation]} // Add Pagination and Navigation modules
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
                            <div className="button-container">
                                <div className="text">{item.text}</div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carousel;
