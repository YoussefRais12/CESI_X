import React, { useEffect, useState } from 'react';
import '../styles/navbar.css';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../redux/userSlice/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart, faShoppingCart, faWallet, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ setPing, ping }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [animationClass, setAnimationClass] = useState('');
    const user = useSelector((state) => state.user?.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const rolesWithPermissions = ["user"];
        // if (user && !rolesWithPermissions.includes(user.role)) {
        //     navigate('/profile');  // Redirect to profile if role does not have specific permissions
        // }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const toggleMenu = () => {
        if (menuOpen) {
            setAnimationClass('fade-out');
            setTimeout(() => {
                setMenuOpen(false);
                setAnimationClass('');
            }, 500); // Match with the CSS animation duration
        } else {
            setMenuOpen(true);
            setAnimationClass('fade-in');
        }
    };

    const handleCloseMenu = () => {
        if (menuOpen) {
            setAnimationClass('fade-out');
            setTimeout(() => {
                setMenuOpen(false);
                setAnimationClass('');
            }, 500); // Match with the CSS animation duration
        }
    };

    return (
        <>
            <div className={`navbar`}>
                <button className="menu-button" onClick={toggleMenu}>☰</button>
                <img src="/logo.svg" alt="App Logo" className="app-logo" />
            </div>

            {menuOpen && (
                <>
                    <div className={`overlay ${animationClass}`} onClick={handleCloseMenu}></div>
                    <div className={`dropdown-menu ${animationClass}`}>
                        <Link to='/profile' onClick={toggleMenu}>
                            <h1 className='dropdown-content'><FontAwesomeIcon icon={faUser} className="menu-icon" /> Profile</h1>
                        </Link>
                        {user?.role === "client" ? (
                            <>
                                <Link to='favoris' onClick={toggleMenu}>
                                <h1 className='dropdown-content'><FontAwesomeIcon icon={faHeart} className="menu-icon" /> Favoris</h1>
                                </Link>
                                <Link to='commandes' onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faShoppingCart} className="menu-icon" /> Commandes</h1>
                                </Link>
                                <Link to='depcomercial' onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faWallet} className="menu-icon" /> Wallet</h1>
                                </Link>
                                <Link to='dashboard' onClick={toggleMenu}>
                                    <h1 className='dropdown-content'><FontAwesomeIcon icon={faTachometerAlt} className="menu-icon"  /> Dashboard</h1>
                                </Link>
                            </>
                        ) : user?.role === "role123" ? (
                            <>
                                <Link to='favoris' onClick={toggleMenu}>
                                    <h1><FontAwesomeIcon icon={faHeart} /> Favoris</h1>
                                </Link>
                            </>
                        ) : user?.role === "role123" ? (
                            <>
                                <Link to='depcomercial' onClick={toggleMenu}>
                                    <h1><FontAwesomeIcon icon={faWallet} /> Depcomercial</h1>
                                </Link>
                            </>
                        ) : user?.role === "role123" ? (
                            <>
                                <Link to='commandes' onClick={toggleMenu}>
                                    <h1><FontAwesomeIcon icon={faShoppingCart} /> Commandes</h1>
                                </Link>
                            </>
                        ) : user?.role === "role123" ? (
                            <>
                                <Link to='favoris' onClick={toggleMenu}>
                                    <h1><FontAwesomeIcon icon={faHeart} /> Favoris</h1>
                                </Link>
                            </>
                        ) : user?.role === "role123" ? (
                            <>
                                <Link to='dashboard' onClick={toggleMenu}>
                                    <h1><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</h1>
                                </Link>
                            </>
                        ) : null}
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}
        </>
    );
}

export default Navbar;
