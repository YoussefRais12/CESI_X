import "./App.css";
import Login from "./pages/Login";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userCurrent } from "./redux/userSlice/userSlice";
import Profile from "./pages/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import Box from "./pages/Box";
import DepComercial from "./pages/DepComercial";
import Hse from "./pages/Hse";
import Navbar from "./components/Navbar";
import Test from "./pages/Test";
import Error from "./pages/Error";
import RequireRole from "./routes/PrivateRoute"; // Ensure this path matches the actual file location
import Dashboard from "./pages/Dashboard";
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
    <>
      {isAuth ? <Navbar /> : null}

      <Routes>
        <Route path="/" element={isAuth ? <Navigate to={`/profile?lang=${lang}`} replace /> : <Login ping={ping} setPing={setPing} />} />
        <Route path="/test" element={<Test />} />

        {/* Applying RequireRole for protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<RequireRole allowedRoles={['user']} userRole={userRole} />}>
            <Route path="/profile" element={<Profile ping={ping} setPing={setPing} />} />
          </Route>
        </Route>
        <Route path="/depcomercial" element={<DepComercial />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/error" element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
