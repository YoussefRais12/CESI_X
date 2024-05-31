import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faHamburger, faBuilding } from '@fortawesome/free-solid-svg-icons';
import '../styles/login.css';
import { userLogin, userRegister } from '../redux/slice/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const LoginContainer = ({ ping, setPing }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [login, setLogin] = useState({ email: '', password: '', showPassword: false });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });
    const [error, setError] = useState('');
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const passwordRef = useRef(null);

    const togglePasswordVisibility = () => {
        setLogin({ ...login, showPassword: !login.showPassword });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (e.target.id === 'email') {
                passwordRef.current.focus();
            } else if (e.target.id === 'password') {
                handleLogin();
            }
        }
    };

    const handleLogin = async () => {
        try {
            setError('');

            const response = await dispatch(userLogin(login));

            if (response.payload.token) {
                navigate('/feed');
                setPing(!ping);
            }
        } catch (error) {
            setError('Email or password incorrect.');
            console.error('Login error:', error);
        }
    };

    const handleRegister = async () => {
        try {
            await dispatch(userRegister(newUser)).unwrap();
            setNewUser({ name: '', email: '', password: '', role: '' });
            handleLoginWithNewUser();
        } catch (error) {
            setError('Error registering user.');
            console.error("Error registering user", error);
        }
    };

    const handleLoginWithNewUser = async () => {
        try {
            setError('');

            const response = await dispatch(userLogin({ email: newUser.email, password: newUser.password }));

            if (response.payload.token) {
                navigate('/feed');
                setPing(!ping);
                setShowCreateAccountModal(false); // Close modal on successful account creation and login
            }
        } catch (error) {
            setError('Error logging in with new account.');
            console.error('Login error:', error);
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && (!newUser.name || !newUser.email)) {
            setError('Name and email are required.');
        } else if (currentStep === 2 && !newUser.password) {
            setError('Password is required.');
        } else if (currentStep === 1 && !validateEmail(newUser.email)) {
            setError('Invalid email format.');
        } else if (currentStep === 2 && !validatePassword(newUser.password)) {
            setError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.');
        } else {
            setError('');
            setCurrentStep(currentStep + 1);
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(String(password));
    };

    const selectRole = (role) => {
        setNewUser({ ...newUser, role:role });
        handleRegister();
    };

    return (
        <div className="login-page">
            <div className="text-container">
                <h1 className="headline">Your favorite meals</h1>
                <h2 className="subheadline">Delivred to you</h2>
                <div className="button-container">
                    <button className="sign-in" onClick={() => setShowSignInModal(true)}>Sign in</button>
                    <button className="create-account" onClick={() => {
                        setNewUser({ name: '', email: '', password: '', role: '' });
                        setCurrentStep(1);
                        setShowCreateAccountModal(true);
                    }}>Create account</button>
                    <p className="terms-text">
                        By signing up, you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>, including <a href="#">Cookie Use</a>.
                    </p>
                </div>
            </div>

            {showSignInModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="login-container">
                            <span className="close" onClick={() => setShowSignInModal(false)}>&times;</span>
                            <h2 className="headline-login">Sign in to use X</h2>
                            <div className="input-container">
                                <input
                                    id="email"
                                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                                    onKeyPress={handleKeyPress}
                                    type="text"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="input-container">
                                <input
                                    id="password"
                                    ref={passwordRef}
                                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                                    onKeyPress={handleKeyPress}
                                    type={login.showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                />
                                <FontAwesomeIcon
                                    icon={login.showPassword ? faEyeSlash : faEye}
                                    onClick={togglePasswordVisibility}
                                    className="eye-icon"
                                />
                            </div>
                            <button onClick={handleLogin}>Next</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                    </div>
                </div>
            )}

            {showCreateAccountModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="login-container">
                            <span className="close" onClick={() => setShowCreateAccountModal(false)}>&times;</span>
                            <h2 className="headline-login">Create your account</h2>
                            {currentStep === 1 && (
                                <div>
                                    <div className="input-container">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                        <span className="input-count">{newUser.name.length} / 50</span>
                                    </div>
                                    <div className="input-container">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div>
                                    <div className="input-container">
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className="role-selection-container">
                                    <button className="role-button" onClick={() => selectRole('client')}>
                                        Client
                                        <FontAwesomeIcon icon={faHamburger} className="role-icon" />
                                    </button>
                                    <button className="role-button" onClick={() => selectRole('entreprise')}>
                                        Entreprise
                                        <FontAwesomeIcon icon={faBuilding} className="role-icon" />
                                    </button>
                                </div>
                            )}
                            {currentStep < 3 && (
                                <button onClick={nextStep}>Next</button>
                            )}
                            {error && <p className="error">{error}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginContainer;
