import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, userCurrent, userEdit, uploadUserImage } from '../redux/slice/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCamera } from '@fortawesome/free-solid-svg-icons';
import AWN from "awesome-notifications";
import "awesome-notifications/dist/style.css"; // Import the CSS for notifications
import { TailSpin } from 'react-loader-spinner';
import '../styles/profile.css';

const Profile = ({ ping, setPing }) => {
    const user = useSelector((state) => state.user?.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const notifier = new AWN();
    const [languageData, setLanguageData] = useState({});
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
    const [isUploading, setIsUploading] = useState(false);

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

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const lang = searchParams.get('lang') || 'en'; // Default language to 'fr'
        import(`../lang/${lang}.json`)
            .then((data) => {
                setLanguageData(data);
            })
            .catch((error) => {
                console.error("Let's try again buddy:", error);
            });
    }, [location.search]);

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
            notifier.alert(languageData.fillAllFields || 'Please fill in all fields to update the profile or change the password.');
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
                    notifier.success(languageData.profileUpdated || 'Profile updated successfully!');
                    setPing(!ping);  // Trigger ping to refresh data if needed
                    setIsEditing(false);
                    setIsEditingPassword(false);
                    setPasswords({ oldPassword: '', newPassword: '' });  // Clear the password fields
                }
            })
            .catch((error) => {
                console.error(error);
                if (error.response && error.response.status === 400) {
                    notifier.alert(languageData.wrongPassword || 'Wrong password');
                } else {
                    notifier.alert(languageData.unexpectedError || 'An unexpected error occurred. Please try again.');
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('img', file);

        setIsUploading(true);

        dispatch(uploadUserImage(formData))
            .unwrap()
            .then((response) => {
                setIsUploading(false);
                if (response.error) {
                    notifier.alert(response.error);
                } else {
                    notifier.success(languageData.imageUploaded || 'Image uploaded successfully!');
                    setPing(!ping);  // Trigger ping to refresh data if needed
                }
            })
            .catch((error) => {
                setIsUploading(false);
                console.error(error);
                notifier.alert(languageData.unexpectedError || 'An unexpected error occurred. Please try again.');
            });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div>
                        <h2>
                            {languageData.accountInfo || 'Account Info'}
                            <FontAwesomeIcon
                                icon={faPen}
                                className="edit-icon"
                                onClick={isEditing ? handleCancel : handleEdit}
                            />
                        </h2>
                        <div className="profile-image-container">
                            {isUploading ? (
                                <div className="loader-container">
                                    <TailSpin
                                        height="100"
                                        width="100"
                                        color="#007bff"
                                        ariaLabel="loading"
                                    />
                                </div>
                            ) : (
                                <>
                                    <img src={user?.img} alt="Profile" className="profile-img" />
                                    <label htmlFor="upload-img" className="camera-icon">
                                        <FontAwesomeIcon icon={faCamera} />
                                    </label>
                                    <input
                                        type="file"
                                        id="upload-img"
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </>
                            )}
                        </div>
                        <div>
                            <p>{languageData.name || 'Name'}:
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
                            <p>{languageData.email || 'Email'}:
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
                            <p>{languageData.role || 'Role'}:
                                <strong> {user?.role}</strong>
                            </p>
                        </div>
                        {isEditing && (
                            <>
                                <button onClick={handleSave} className="profile-button">
                                    {languageData.save || 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                );
            case 'security':
                return (
                    <div>
                        <h2>
                            {languageData.security || 'Security'}
                            <FontAwesomeIcon
                                icon={faPen}
                                className="edit-icon"
                                onClick={isEditingPassword ? handleCancelPassword : handleEditPassword}
                            />
                        </h2>
                        {isEditingPassword ? (
                            <div>
                                <p>{languageData.oldPassword || 'Old Password'}:
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passwords.oldPassword}
                                        onChange={handlePasswordChange}
                                        className="profile-input"
                                    />
                                </p>
                                <p>{languageData.newPassword || 'New Password'}:
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwords.newPassword}
                                        onChange={handlePasswordChange}
                                        className="profile-input"
                                    />
                                </p>
                                <button onClick={handleSave} className="profile-button">
                                    {languageData.changePassword || 'Change Password'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p>{languageData.password || 'Password'}:
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
                    <h3>{languageData.userAccount || 'User Account'}</h3>
                    <button
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        {languageData.accountInfo || 'Account Info'}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        {languageData.security || 'Security'}
                    </button>
                    <button className="logout-button" onClick={() => {
                        dispatch(logout());
                        navigate("/");
                        setPing(!ping);
                    }}>
                        {languageData.logout || 'Logout'}
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
