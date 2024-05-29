import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/cardCarousel.css'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import Card from './Card'; // Import the Card component

const CardCarousel = ({ items, carouselId }) => {
    const navigate = useNavigate();

    const handleItemClick = (link) => {
        navigate(link);
    };

    return (
        <Box sx={{ margin: '20px 0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2></h2>
                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <IconButton className={`prev-${carouselId}`}>
                        <FontAwesomeIcon icon={faChevronLeft} className="carousel-control" />
                    </IconButton>
                    <IconButton className={`next-${carouselId}`}>
                        <FontAwesomeIcon icon={faChevronRight} className="carousel-control" />
                    </IconButton>
                </Box>
            </Box>
            <Swiper
                spaceBetween={10} // Adjust space between slides
                pagination={{ clickable: true }}
                navigation={{ nextEl: `.next-${carouselId}`, prevEl: `.prev-${carouselId}` }}
                slidesPerView={5}
                className="mySwiper"
                modules={[Pagination, Navigation]}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id} className="swiper-slide">
                        <Box onClick={() => handleItemClick(item.link)} sx={{ cursor: 'pointer' }}>
                            <Card
                                img={item.img}
                                title={item.title}
                                description={item.content}
                            />
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default CardCarousel;
