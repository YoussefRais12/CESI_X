import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/error.css';

const Error = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/profile');
    };

    return (
        <div className="error-page">
            <div className="error-container">
                <img src="/error-image.jpg" alt="Error" className="error-image" />
                <p>You do not have permission to access this page.</p>
                <button onClick={handleGoHome} className="error-button">Go to Home</button>
            </div>
        </div>
    );
};

export default Error;
