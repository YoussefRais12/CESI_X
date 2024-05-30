import React, { useEffect, useState } from 'react';
import '../styles/profile.css';
import { logout, userCurrent, userEdit } from '../redux/userSlice/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const Profile = ({ ping, setPing }) => {
    const user = useSelector((state) => state.user?.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState({
        id: user?._id, // Assuming the user ID is stored as _id
        name: user?.name || '',
        email: user?.email || ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [languageData, setLanguageData] = useState([]);
    useEffect(() => {
        if (!user) {
            dispatch(userCurrent());
        } else {
            setProfile({
                id: user._id,
                name: user.name,
                email: user.email,
            });
        }
    }, [user, dispatch]);

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        dispatch(userEdit(profile))
            .unwrap()
            .then((response) => {
                alert('Profile updated successfully!');
                setPing(!ping);  // Trigger ping to refresh data if needed
                setIsEditing(false);
            })
            .catch((error) => console.error(error));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };
    // Get lang parameter from URL
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get('lang');
    console.log('Language parameter:', lang);
    console.log(profile);
    console.log(`../lang/${lang}.json`)
    console.log('useEffect triggered with lang:', lang);
    import(`../lang/${lang}.json`)
        .then((data) => {
            setLanguageData(data);
        })
        .catch((error) => {
            console.error("Error loading language file:", error);
        });
    console.log(languageData)
    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>{languageData.profile}</h1>
                <img src="/images.png" alt="Profile" className="profile-img" />
                <div>
                    <p>{languageData.greeting}: 
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={ profile.name}
                                onChange={handleChange}
                                className="profile-input"
                            />
                        ) : (
                            <strong> { profile.name}</strong>
                        )}
                    </p>
                    <p>{languageData.email}:
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={ profile.email}
                                onChange={handleChange}
                                className="profile-input"
                            />
                        ) : (
                            <strong> { profile.email}</strong>
                        )}
                    </p>
                    <p>{languageData.Role}:
                        <strong> { user?.role}</strong>
                    </p>
                </div>
                {isEditing ? (
                    <button onClick={handleSave} className="profile-button">Save</button>
                ) : (
                    <button onClick={handleEdit} className="profile-button">Edit</button>
                )}
                <h4
                    onClick={() => {
                        dispatch(logout());
                        navigate("/");
                        setPing(!ping);
                    }}>
                    {languageData.Logout}
                </h4>
            </div>
        </div>
    );
}

export default Profile;
