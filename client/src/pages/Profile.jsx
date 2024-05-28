import React, { useEffect, useState } from 'react';
import '../styles/profile.css';
import { logout, userCurrent, userEdit } from '../redux/userSlice/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications

const Profile = ({ ping, setPing }) => {
    const user = useSelector((state) => state.user?.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notifier = new AWN();

    const [profile, setProfile] = useState({
        id: user?._id, // Assuming the user ID is stored as _id
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [error, setError] = useState('');
    console.log(error);

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

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        setError('');

        if ((isEditingPassword && (!passwords.oldPassword || !passwords.newPassword)) || (!profile.name && !profile.email)) {
            notifier.alert('Please fill in all fields to update the profile or change the password.');
            return;
        }

        const data = { ...profile };
        if (isEditingPassword) {
            data.password = passwords.newPassword;
            data.oldPassword = passwords.oldPassword;
        }

        dispatch(userEdit(data))
            .unwrap()
            .then((response) => {
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success('Profile updated successfully!');
                    setPing(!ping);  // Trigger ping to refresh data if needed
                    setIsEditing(false);
                    setIsEditingPassword(false);
                    setPasswords({ oldPassword: '', newPassword: '' });  // Clear the password fields
                }
            })
            .catch((error) => {
                console.error(error);
                if (error.response && error.response.status === 400) {
                    notifier.alert('Wrong password');
                } else {
                    notifier.alert('An unexpected error occurred. Please try again.');
                }
                setError(error.message);
            });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleEditPassword = () => {
        setIsEditingPassword(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfile({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    };

    const handleCancelPassword = () => {
        setIsEditingPassword(false);
        setPasswords({ oldPassword: '', newPassword: '' });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div>
                        <h2>
                            Account Info 
                            <FontAwesomeIcon 
                                icon={faPen} 
                                className="edit-icon" 
                                onClick={isEditing ? handleCancel : handleEdit} 
                            />
                        </h2>
                        <img src="/images.png" alt="Profile" className="profile-img" />
                        <div>
                            <p>Name: 
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <strong> {profile.name}</strong>
                                )}
                            </p>
                            <p>Email:
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />
                                ) : (
                                    <strong> {profile.email}</strong>
                                )}
                            </p>
                            <p>Role:
                                <strong> {user?.role}</strong>
                            </p>
                        </div>
                        {isEditing && (
                            <>
                                <button onClick={handleSave} className="profile-button">Save</button>
                               
                            </>
                        )}
                    </div>
                );
            case 'security':
                return (
                    <div>
                        <h2>
                            Security 
                            <FontAwesomeIcon 
                                icon={faPen} 
                                className="edit-icon" 
                                onClick={isEditingPassword ? handleCancelPassword : handleEditPassword} 
                            />
                        </h2>
                        {isEditingPassword ? (
                            <div>
                                <p>Old Password:
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passwords.oldPassword}
                                        onChange={handlePasswordChange}
                                        className="profile-input"
                                    />
                                </p>
                                <p>New Password:
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwords.newPassword}
                                        onChange={handlePasswordChange}
                                        className="profile-input"
                                    />
                                </p>
                                <button onClick={handleSave} className="profile-button">Change Password</button>
                            </div>
                        ) : (
                            <div>
                                <p>Password: 
                                    <strong>********</strong> 
                                </p>
                            </div>
                        )}
                        {error && <p className="error">{error}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="sidebar">
                    <h3>User Account</h3>
                    <button 
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Account Info
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    <button className="logout-button" onClick={() => {
                        dispatch(logout());
                        navigate("/");
                        setPing(!ping);
                    }}>
                        Logout
                    </button>
                </div>
                <div className="content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
