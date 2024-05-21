import "./App.css";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { userCurrent } from "./redux/userSlice/userSlice";
import Profile from "./pages/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import Commandes from "./pages/Commandes";
import DepComercial from "./pages/DepComercial";
import Favoris from "./pages/Favoris";
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
console.log('userRole',userRole);
  useEffect(() => {
    if (isAuth) {
      dispatch(userCurrent());
    }
  }, [dispatch, isAuth, ping]);

  return (
    <>
    {isAuth ? <Navbar/> : null}

    <Routes>
    <Route path="/" element={isAuth ? <path to="/profile" replace /> : <Login ping={ping} setPing={setPing} />} />
        <Route path="/test" element={<Test/>} />

        {/* Applying RequireRole for protected routes */}
        <Route element={<PrivateRoute/>}>
            <Route element={<RequireRole allowedRoles={['user']} userRole={userRole}/>}>
                <Route path="/profile" element={<Profile ping={ping} setPing={setPing}/>} />
            </Route>
        </Route>
        <Route path="/commandes" element={<Commandes/>} />
        <Route path="/depcomercial" element={<DepComercial/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/favoris" element={<Favoris/>} />
        <Route path="/error" element={<Error/>} />
    </Routes>
</>
  );
}

export default App;
