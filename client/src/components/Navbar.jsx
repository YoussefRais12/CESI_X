import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slice/userSlice";
import { fetchRestaurantsByOwnerId } from "../redux/slice/restaurantSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHeart,
  faShoppingCart,
  faWallet,
  faTachometerAlt,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { Input, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import $ from "jquery";

const Navbar = ({ setPing, ping }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [animationClass, setAnimationClass] = useState("");
  const [cartAnimationClass, setCartAnimationClass] = useState("");
  const user = useSelector((state) => state.user?.user);
  const ownedRestaurants = useSelector(
    (state) => state.restaurant?.ownedRestaurants
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.role === "restaurantOwner") {
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
      setAnimationClass("fade-out");
      setTimeout(() => {
        setMenuOpen(false);
        setAnimationClass("");
      }, 500);
    } else {
      setMenuOpen(true);
      setAnimationClass("fade-in");
    }
  };

  const handleSearchInput = async (event) => {
    // const name = event.target.value;
    // if (name.length >= 3) {
    //   var encodedName = encodeURIComponent(name);

    //   $.ajax({
    //     // url: "http://localhost:5000/restaurant/${name}",
    //     url: "http://localhost:5000/restaurant/name/${name}",
    //     type: "GET",
    //     data: { name: encodedName },
    //     success: function (response) {
    //       // $('#search-result').html(JSON.stringify(response, null, 2));
    //       setSearchResults(response);
    //     },
    //     error: function (xhr, status, error) {
    //       console.error("Error", xhr.responseText);
    //       setSearchResults([]);

    //       // $('#search-result').html('Error:' + xhr.responseText);
    //     },
    //   });
    // } else {
    //   // $('#search-result').html('');
    //   setSearchResults([]);
    // }

    const name = event.target.value.trim().toLowerCase();
    // setSearchResults(name);
    if (name.length >= 3) {
      try {
        const response = await axios.get(
          `http://localhost:5000/restaurant/name/${name}`
        );

        if (Array.isArray(response.data)) {
          setSearchResults(response.data);
        } else {
          console.error("Error, let's try again");
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleCart = () => {
    if (cartOpen) {
      setCartAnimationClass("fade-out");
      setTimeout(() => {
        setCartOpen(false);
        setCartAnimationClass("");
      }, 500);
    } else {
      setCartOpen(true);
      setCartAnimationClass("fade-in");
    }
  };

  const handleCloseMenu = () => {
    if (menuOpen) {
      setAnimationClass("fade-out");
      setTimeout(() => {
        setMenuOpen(false);
        setAnimationClass("");
      }, 500);
    }
  };

  const handleCloseCart = () => {
    if (cartOpen) {
      setCartAnimationClass("fade-out");
      setTimeout(() => {
        setCartOpen(false);
        setCartAnimationClass("");
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
        return null;
      case "restaurantOwner":
        return (
          <button className="dropdown-button" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faStore} /> My Restaurants
          </button>
        );
      default:
        return (
          <div className="auth-buttons">
            <button className="sign-in" onClick={() => navigate("/")}>
              Sign in
            </button>
            <button className="sign-up" onClick={() => navigate("/")}>
              Sign up
            </button>
          </div>
        );
    }
  };

  const [languageData, setLanguageData] = useState({});
  const searchParams = new URLSearchParams(location.search);
  const lang = searchParams.get("lang") || "fr";

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
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>
        <Link to={`/feed?lang=${lang}`}>
          <img src="/logo.svg" alt="App Logo" className="app-logo" />
        </Link>
        <div className="spacer"></div>
        <div className="search-container">
          <IconButton type="submit" aria-label="search">
            <SearchIcon />
          </IconButton>
          <Input
            placeholder="Search in CESI_X"
            inputProps={{ "aria-label": "search" }}
            className="search-input"
            onChange={handleSearchInput}
          />
        </div>

        <div id="result">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((result) => (
                <li key={result._id}>
                  <Link to={`/restaurant/${result._id}`}>{result.name}</Link>
                </li>
              ))}
            </ul>
          ) : searchResults.length >= 3 ? (
            <p>No results found</p>
          ) : null}
        </div>

        {/* <div id="result">
          {searchResults.length >= 3 && searchResults.length > 0 ? (
            <ul>
              {this.state.searchResults.map((result) => (
                <li key={this.state.result._id}>
                  <Link to={`/restaurant/${result._id}`}>{result.name}</Link>
                </li>
              ))}
            </ul>
          ) : searchResults.length >= 3 ? ( // Show "No results found" only when searchTerm length >= 3
            <p> No results found </p>
          ) : null}
        </div> */}

        {renderCartOrAuthButtons()}
      </div>

      {menuOpen && (
        <>
          <div
            className={`overlay ${animationClass}`}
            onClick={handleCloseMenu}
          ></div>
          <div className={`dropdown-menu ${animationClass}`}>
            <Link to={`/profile?lang=${lang}`} onClick={toggleMenu}>
              <h1 className="dropdown-content">
                <FontAwesomeIcon icon={faUser} className="menu-icon" />
                {languageData.profile}
              </h1>
            </Link>
            {user?.role === "admin" && (
              <>
                <Link to={`/usermanagement?lang=${lang}`} onClick={toggleMenu}>
                  <h1 className="dropdown-content">
                    <FontAwesomeIcon
                      icon={faTachometerAlt}
                      className="menu-icon"
                    />{" "}
                    User Management
                  </h1>
                </Link>
                <Link to={`/feed?lang=${lang}`} onClick={toggleMenu}>
                  <h1 className="dropdown-content">
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className="menu-icon"
                    />{" "}
                    Feed
                  </h1>
                </Link>
              </>
            )}
            {user?.role === "restaurantOwner" && (
              <>
                <h1 className="dropdown-content" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faStore} className="menu-icon" /> My
                  Restaurants
                </h1>
                {ownedRestaurants && ownedRestaurants.length > 0 ? (
                  ownedRestaurants.map((restaurant) => (
                    <Link
                      to={`/restaurant/${restaurant._id}`}
                      key={restaurant._id}
                      onClick={toggleMenu}
                    >
                      <h2 className="submenu-item">{restaurant.name}</h2>
                    </Link>
                  ))
                ) : (
                  <p className="submenu-item">No restaurants found</p>
                )}
              </>
            )}
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      )}

      {cartOpen && (
        <>
          <div
            className={`overlay ${cartAnimationClass}`}
            onClick={handleCloseCart}
          ></div>
          <div className={`cart-menu ${cartAnimationClass}`}>
            <h1 className="dropdown-content">Cart Content</h1>
            <button className="close-cart-button" onClick={handleCloseCart}>
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
