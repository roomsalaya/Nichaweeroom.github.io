import React from 'react';
import Navbar from './Navbar';
import './Home.css';
import { Carousel } from 'antd';

// Import images (if they are inside the src directory)
import image1 from '../assets/แจ้งซ่อม.webp';
import image2 from '../assets/พัสดุ.webp';
import ParcelList from './ParcelList';

const images = [image1, image2];

const Home: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className="home">
                <div className="home-carousel-container">
                    <Carousel autoplay>
                        {images.map((imgSrc, index) => (
                            <div key={index}>
                                <img src={imgSrc} alt={`Slide ${index + 1}`} />
                            </div>
                        ))}
                    </Carousel>
                    <ParcelList />
                </div>
            </div>
        </>
    );
};

export default Home;
