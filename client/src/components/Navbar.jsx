import React, { useEffect } from 'react';
import '../styles/navbar.css';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../redux/userSlice/userSlice'; // Ensure this is the correct path and function name

const Navbar = ({ setPing, ping }) => {
    const user = useSelector((state) => state.user?.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redirect users with no appropriate role permissions
    useEffect(() => {
        const rolesWithPermissions = ["chef service hse", "responsable energie", "responsable commercial", "responsable erp", "chef securite"];
        if (user && !rolesWithPermissions.includes(user.role)) {
            navigate('/profile');  // Redirect to profile if role does not have specific permissions
        }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    return (
        <>
            <div className="navbar">
                <a href="http://www.sotulub.com.tn/fr">
                    <img src="/sotulub.jpg" alt="Logo" className="logo" />
                </a>
                <Link to='/profile'>
                    <h1>Profile</h1>
                </Link>
                {user?.role === "chef service hse" ? (
                    <>
                        <Link to='hse'>
                            <h1>Manuel</h1>
                        </Link>
                        <Link to='box'>
                            <h1>Box</h1>
                        </Link>
                        <Link to='depcomercial'>
                            <h1>Depcomercial</h1>
                        </Link>
                        <Link to='dashboard'>
                            <h1>Dashboard</h1>
                        </Link>
                    </>
                ) : user?.role === "responsable energie" ? (
                    <>
                        <Link to='hse'>
                            <h1>Manuel</h1>
                        </Link>
                    </>
                ) : user?.role === "responsable commercial" ? (
                    <>
                        <Link to='depcomercial'>
                            <h1>Depcomercial</h1>
                        </Link>
                    </>
                ) : user?.role === "responsable erp" ? (
                    <>
                        <Link to='box'>
                            <h1>Box</h1>
                        </Link>
                    </>
                ) : user?.role === "chef securité" ? (
                    <>
                        <Link to='hse'>
                            <h1>Manuel</h1>
                        </Link>
                    </>
                ) : user?.role === "responsable commercial" ? (
                    <>
                        <Link to='dashboard'>
                            <h1>Dashboard</h1>
                        </Link>
                    </>
                    ): null}
                <img src="/TUNISIE.jpg" alt="tun" className="tun" />
            </div>
        </>
    );
}

export default Navbar;
