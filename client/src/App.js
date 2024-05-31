import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom"; // Add Navigate import here
import { useDispatch, useSelector } from "react-redux";
import { userCurrent } from "./redux/slice/userSlice";
import "./App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import Commandes from "./pages/Commandes";
import DepComercial from "./pages/DepComercial";
import Favoris from "./pages/Favoris";
import Navbar from "./components/Navbar";
import Test from "./pages/Test";
import Error from "./pages/Error";
import Feed from "./pages/Feed";
import RequireRole from "./routes/PrivateRoute"; // Ensure this path matches the actual file location
import Dashboard from "./pages/Dashboard";
import RestaurantDetail from "./pages/RestaurantDetail"; // Import RestaurantDetail
import './App.css'; // Import the global CSS file

function App() {
  const dispatch = useDispatch();
  const isAuth = localStorage.getItem("token");
  const [ping, setPing] = useState(false);
  const userRole = useSelector(state => state.user.role); // Assuming role is part of user state
  console.log('userRole', userRole);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const lang = searchParams.get('lang') || 'fr'; // Default language to 'fr'
  
  useEffect(() => {
    if (isAuth) {
      dispatch(userCurrent());
    }
    if (location.pathname === '/') {
      navigate(`/profile?lang=${lang}`, { replace: true });
    }
  }, [dispatch, isAuth, location.pathname, lang, navigate]);

  return (
    <div className="app-container">
      {/* Conditionally render Navbar based on the current path */}
      {location.pathname !== '/' && <Navbar />}

      <div className="content">
        <Routes>
          <Route path="/" element={isAuth ? <Navigate to="/profile" replace /> : <Login ping={ping} setPing={setPing} />} />
          <Route path="/test" element={<Test />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} /> {/* Add this line for RestaurantDetail */}
          
          {/* Applying RequireRole for protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<RequireRole allowedRoles={['user']} userRole={userRole} />}>
              <Route path="/profile" element={<Profile ping={ping} setPing={setPing} />} />
            </Route>
          </Route>
          <Route path="/commandes" element={<Commandes />} />
          <Route path="/depcomercial" element={<DepComercial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/favoris" element={<Favoris />} />
          <Route path="/error" element={<Error />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
