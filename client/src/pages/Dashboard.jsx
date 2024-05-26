import React, { useEffect, useState } from "react";
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, userEdit, userDelete, userAdd } from '../redux/userSlice/userSlice';
const UserRole = require('../type.tsx');

const Dashboard = () => {
    const currentUser = useSelector((state) => state.user?.user);
    const users = useSelector((state) => state.user?.users);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });

    useEffect(() => {
        const allowedRoles = [UserRole.admin];
        if (!allowedRoles.includes(currentUser?.role)) {
            navigate('/error');
        } else {
            dispatch(fetchAllUsers());
        }
    }, [currentUser, navigate, dispatch]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await dispatch(userEdit({ id: userId, role: newRole })).unwrap();
            alert('Role updated successfully!');
        } catch (error) {
            console.error("Error updating role", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await dispatch(userDelete(userId)).unwrap();
            alert('User deleted successfully!');
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };

    const handleAddUser = async () => {
        try {
            await dispatch(userAdd(newUser)).unwrap();
            setNewUser({ name: '', email: '', password: '', role: '' });
            alert('User added successfully!');
        } catch (error) {
            console.error("Error adding user", error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="users-list">
                {users.map((user) => (
                    <div key={user._id} className="user-card">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong></p>
                        {user._id !== currentUser._id ? (
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            >
                                <option value="chef service hse">Chef Service HSE</option>
                                <option value="chef securité">Chef Securité</option>
                                <option value="responsable erp">Responsable ERP</option>
                                <option value="responsable commercial">Responsable Commercial</option>
                                <option value="responsable energie">Responsable Energie</option>
                            </select>
                        ) : (
                            <span>{user.role}</span>
                        )}
                        {user._id !== currentUser._id && (
                            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                        )}
                    </div>
                ))}
            </div>
            <div className="add-user-form">
                <h2>Add New User</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
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
                <button onClick={handleAddUser}>Add User</button>
            </div>
        </div>
    );
};

export default Dashboard;
