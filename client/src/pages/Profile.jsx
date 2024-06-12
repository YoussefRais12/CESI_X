import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, userCurrent, userEdit, uploadUserImage, userDelete } from '../redux/slice/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCamera } from '@fortawesome/free-solid-svg-icons';
import AWN from 'awesome-notifications';
import 'awesome-notifications/dist/style.css';
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
    id: user?._id,
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phoneNumber: user?.phoneNumber || ''
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
        address: user.address,
        phoneNumber: user.phoneNumber
      });
    }
  }, [user, dispatch]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get('lang') || 'en';
    import(`../lang/${lang}.json`)
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error('Error loading language data:', error);
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
          setPing(!ping);
          setIsEditing(false);
          setIsEditingPassword(false);
          setPasswords({ oldPassword: '', newPassword: '' });
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
      address: user.address,
      phoneNumber: user.phoneNumber
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
          setPing(!ping);
        }
      })
      .catch((error) => {
        setIsUploading(false);
        console.error(error);
        notifier.alert(languageData.unexpectedError || 'An unexpected error occurred. Please try again.');
      });
  };

  const handleDeleteAccount = () => {
    if (window.confirm(languageData.confirmDeleteAccount || 'Are you sure you want to delete your account? This action cannot be undone.')) {
      dispatch(userDelete(user._id))
        .unwrap()
        .then(() => {
          notifier.success(languageData.accountDeleted || 'Account deleted successfully.');
          dispatch(logout());
          navigate('/');
          setPing(!ping);
        })
        .catch((error) => {
          console.error(error);
          notifier.alert(languageData.unexpectedError || 'An unexpected error occurred. Please try again.');
        });
    }
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
                style={{ cursor: 'pointer', marginLeft: '10px' }}
                onClick={isEditing ? handleCancel : handleEdit}
              />
            </h2>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {isUploading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                  <TailSpin
                    height="100"
                    width="100"
                    color="#007bff"
                    ariaLabel="loading"
                  />
                </div>
              ) : (
                <>
                  <img 
                    src={user?.img || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <label htmlFor="upload-img" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%', padding: '5px', cursor: 'pointer', color: 'white' }}>
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
                    style={{ marginLeft: '10px' }}
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
                    style={{ marginLeft: '10px' }}
                  />
                ) : (
                  <strong> {profile.email}</strong>
                )}
              </p>
              <p>{languageData.address || 'Address'}:
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    style={{ marginLeft: '10px' }}
                  />
                ) : (
                  <strong> {profile.address}</strong>
                )}
              </p>
              <p>{languageData.phoneNumber || 'Phone Number'}:
                {isEditing ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    style={{ marginLeft: '10px' }}
                  />
                ) : (
                  <strong> {profile.phoneNumber}</strong>
                )}
              </p>
              <p>{languageData.role || 'Role'}:
                <strong> {user?.role}</strong>
              </p>
            </div>
            {isEditing && (
              <>
                <button onClick={handleSave} style={{ marginTop: '10px' }}>
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
                style={{ cursor: 'pointer', marginLeft: '10px' }}
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
                    style={{ marginLeft: '10px' }}
                  />
                </p>
                <p>{languageData.newPassword || 'New Password'}:
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    style={{ marginLeft: '10px' }}
                  />
                </p>
                <button onClick={handleSave} style={{ marginTop: '10px' }}>
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
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        );
      case 'delete':
        return (
          <div>
            <h2>{languageData.deleteAccount || 'Delete Account'}</h2>
            <p>{languageData.deleteAccountWarning || 'Warning: Deleting your account is permanent and cannot be undone.'}</p>
            <button onClick={handleDeleteAccount} style={{ marginTop: '10px', color: 'red' }}>
              {languageData.deleteAccount || 'Delete Account'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '1', padding: '20px', borderRight: '1px solid #ddd' }}>
        <h3>{languageData.userAccount || 'User Account'}</h3>
        <button
          style={{ display: 'block', padding: '10px', cursor: 'pointer', background: activeTab === 'info' ? '#ddd' : 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
          onClick={() => setActiveTab('info')}
        >
          {languageData.accountInfo || 'Account Info'}
        </button>
        <button
          style={{ display: 'block', padding: '10px', cursor: 'pointer', background: activeTab === 'security' ? '#ddd' : 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
          onClick={() => setActiveTab('security')}
        >
          {languageData.security || 'Security'}
        </button>
        <button
          style={{ display: 'block', padding: '10px', cursor: 'pointer', background: activeTab === 'delete' ? '#ddd' : 'transparent', border: 'none', textAlign: 'left', width: '100%', color: 'red' }}
          onClick={() => setActiveTab('delete')}
        >
          {languageData.deleteAccount || 'Delete Account'}
        </button>
        <button
          style={{ display: 'block', padding: '10px', cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', width: '100%', color: 'red' }}
          onClick={() => {
            dispatch(logout());
            navigate('/');
            setPing(!ping);
          }}
        >
          {languageData.logout || 'Logout'}
        </button>
      </div>
      <div style={{ flex: '3', padding: '20px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
