import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/login.css';
import { userLogin, userRegister } from '../redux/userSlice/userSlice';
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
                navigate('/profile');
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
            alert('User registered successfully!');
            setShowCreateAccountModal(false); // Close modal on successful account creation
        } catch (error) {
            setError('Error registering user.');
            console.error("Error registering user", error);
        }
    };

    return (
        <div className="login-page">
            <div className="text-container">
                <h1 className="headline">Happening now</h1>
                <h2 className="subheadline">Join today.</h2>
                <div className="button-container">
                    <button className="sign-in" onClick={() => setShowSignInModal(true)}>Sign in</button>
                    <button className="create-account" onClick={() => setShowCreateAccountModal(true)}>Create account</button>
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
                            <div className="input-container">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="input-container">
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="">Select Role</option>
                                    <option value="chef service hse">Chef Service HSE</option>
                                    <option value="chef securité">Chef Securité</option>
                                    <option value="responsable erp">Responsable ERP</option>
                                    <option value="responsable commercial">Responsable Commercial</option>
                                    <option value="responsable energie">Responsable Energie</option>
                                </select>
                            </div>
                            <button onClick={handleRegister}>Next</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginContainer;
