import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
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
import TestStripe from "./pages/TestStripe";
import Error from "./pages/Error";
import Feed from "./pages/Feed";
import RequireRole from "./routes/PrivateRoute"; // Ensure this path matches the actual file location
import Dashboard from "./pages/Dashboard";
import RestaurantDetail from "./pages/RestaurantDetail"; // Import RestaurantDetail

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

function App() {
  const dispatch = useDispatch();
  const isAuth = localStorage.getItem("token");
  const [ping, setPing] = useState(false);
  const userRole = useSelector(state => state.user.user?.role);
  const userLang = useSelector(state => state.user.user?.lang);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const langUrl = userLang == undefined?"fr": userLang
  const lang = searchParams.get('lang') || langUrl; 
  const stripePromise = loadStripe('pk_test_51PMUzFKJ5LRFuT3XFS2dKbfHUQm734UzoqoQXunU66rfSFilgwLXyqIBrbuecc83rlMTKQxEzijrX7iQAqPGIXXz00av4XhuzD');
  
  useEffect(() => {
    if (isAuth) {
      dispatch(userCurrent());
    }
    if (isAuth && location.pathname === '/') {
      navigate(`/profile?lang=${lang}`, { replace: true });
    }
  }, [dispatch, isAuth, location.pathname, lang, navigate]);

  return (
    <div className="app-container">
      {/* Conditionally render Navbar based on the current path */}
      {location.pathname !== '/' && <Navbar />}

      <div className="content">
        <Elements stripe={stripePromise}>
          <Routes>
            <Route path="/" element={isAuth ? <Navigate to={"/profile?lang="+lang} replace /> : <Login ping={ping} setPing={setPing} />} />
            <Route path="/test" element={<Test />} />
            <Route path="/teststripe" element={<TestStripe />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} /> {/* Add this line for RestaurantDetail */}
            
            {/* Applying RequireRole for protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<RequireRole allowedRoles={['user']} userRole={userRole} />}>
                <Route path={"/profile"}  element={<Profile ping={ping} setPing={setPing} />} />
              </Route>
            </Route>
            <Route path={"/commandes"} element={<Commandes />} />
            <Route path={"/depcomercial"} element={<DepComercial />} />
            <Route path={"/dashboard"} element={<Dashboard />} />
            <Route path={"/favoris"} element={<Favoris />} />
            <Route path={"/error"} element={<Error />} />
            <Route path={"/feed"} element={<Feed />} />
          </Routes>
        </Elements>
      </div>
    </div>
  );
}

export default App;
