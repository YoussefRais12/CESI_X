import React, { useState, useEffect } from 'react';
import '../styles/navbar.css';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../redux/slice/userSlice';
import { fetchRestaurantsByOwnerId } from '../redux/slice/restaurantSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart, faShoppingCart, faWallet, faTachometerAlt, faStore } from '@fortawesome/free-solid-svg-icons';
import { Input, Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {useLocation } from "react-router-dom";

const Navbar = ({ setPing, ping }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [animationClass, setAnimationClass] = useState('');
    const [cartAnimationClass, setCartAnimationClass] = useState('');
    const user = useSelector((state) => state.user?.user);
    const ownedRestaurants = useSelector((state) => state.restaurant?.ownedRestaurants);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'restaurantOwner') {
            dispatch(fetchRestaurantsByOwnerId(user._id));
        }
    }, [dispatch, user, ping]); // Add ping as a dependency

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
        window.location.reload();
    };

    const toggleMenu = () => {
        if (menuOpen) {
            setAnimationClass('fade-out');
            setTimeout(() => {
                setMenuOpen(false);
                setAnimationClass('');
            }, 500);
        } else {
            setMenuOpen(true);
            setAnimationClass('fade-in');
        }
    };

    const toggleCart = () => {
        if (cartOpen) {
            setCartAnimationClass('fade-out');
            setTimeout(() => {
                setCartOpen(false);
                setCartAnimationClass('');
            }, 500);
        } else {
            setCartOpen(true);
            setCartAnimationClass('fade-in');
        }
    };

    const handleCloseMenu = () => {
        if (menuOpen) {
            setAnimationClass('fade-out');
            setTimeout(() => {
                setMenuOpen(false);
                setAnimationClass('');
            }, 500);
        }
    };

    const handleCloseCart = () => {
        if (cartOpen) {
            setCartAnimationClass('fade-out');
            setTimeout(() => {
                setCartOpen(false);
                setCartAnimationClass('');
            }, 500);
        }
    };

    const renderCartOrAuthButtons = () => {
        switch (user?.role) {
            case "client":
                return (
                    <button className="cart-button" onClick={toggleCart}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                    </button>
                );
            case "admin":
                return <h1>admin</h1>;
            case "restaurantOwner":
                return (
                    <button className="dropdown-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faStore} /> My Restaurants
                    </button>
                );
            default:
                return (
                    <div className="auth-buttons">
                        <button className="sign-in" onClick={() => navigate('/')}>Sign in</button>
                        <button className="sign-up" onClick={() => navigate('/')}>Sign up</button>
                    </div>
                );
        }
    };
    // ************************** lang section ************************** //
    const [languageData, setLanguageData] = useState({});
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get('lang') || "fr";
    useEffect(() => {
        import(`../lang/${lang}.json`)
            .then((data) => {
                setLanguageData(data);
            })
            .catch((error) => {
                console.error("Error loading language file:", error);
            });
    }, [location.search]);
    return (
        <>
            <div className={`navbar`}>
                <button className="menu-button" onClick={toggleMenu}>☰</button>
                <Link to={"/feed?lang="+lang}>
                    <img src="/logo.svg" alt="App Logo" className="app-logo" />
                </Link>
                <div className="spacer"></div>
                <div className="search-container">
                    <IconButton type="submit" aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <Input
                        placeholder="Search in CESI_X"
                        inputProps={{ 'aria-label': 'search' }}
                        className="search-input"
                    />
                </div>
                <button className="dropdown-button" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faStore} /> My orders
                </button>
                {renderCartOrAuthButtons()}
            </div>
    
            {menuOpen && (
                <>
                    <div className={`overlay ${animationClass}`} onClick={handleCloseMenu}></div>
                    <div className={`dropdown-menu ${animationClass}`}>
                        <Link to={'/profile?lang='+lang} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faUser} className="menu-icon" />{languageData.profile}</h1>
                        </Link>
                        <Link to={'/favoris?lang='+lang} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faHeart} className="menu-icon" />{languageData.Favoris}</h1>
                        </Link>
                        <Link to={'/commandes?lang='+lang} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" />{languageData.Commandes}</h1>
                        </Link>
                        <Link to={'/depcomercial?lang='+lang} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faWallet} className="menu-icon" />{languageData.Wallet}</h1>
                        </Link>
                        <Link to={'/dashboard?lang='+lang} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faTachometerAlt} className="menu-icon" />{languageData.Dashboard}</h1>
                        </Link>
                        
                        {user?.role === 'restaurantOwner' && (
                            <>
                                <h1 className='dropdown-content' onClick={toggleMenu}>
                                    <FontAwesomeIcon icon={faStore} className="menu-icon" /> My Restaurants
                                </h1>
                                {ownedRestaurants && ownedRestaurants.length > 0 ? (
                                    ownedRestaurants.map((restaurant) => (
                                        <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} onClick={toggleMenu}>
                                            <h2 className='submenu-item'>{restaurant.name}</h2>
                                        </Link>
                                    ))
                                ) : (
                                    <p className='submenu-item'>No restaurants found</p>
                                )}
                            </>
                        )}
                        <Link to={'/Commandes?lang='+lang} onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faTachometerAlt} className="menu-icon" />{languageData.Commande}</h1>
                        </Link>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}
    
            {cartOpen && (
                <>
                    <div className={`overlay ${cartAnimationClass}`} onClick={handleCloseCart}></div>
                    <div className={`cart-menu ${cartAnimationClass}`}>
                        <h1 className='dropdown-content'>Cart Content</h1>
                        <button className="close-cart-button" onClick={handleCloseCart}>Close</button>
                    </div>
                </>
            )}
        </>
    );
}

export default Navbar;
