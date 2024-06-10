// UserDetails.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, fetchUserLogs } from '../redux/slice/userSlice';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar } from '@mui/material';
import '../styles/userDetails.css';

const UserDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { selectedUser, logs, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchUserLogs(id));
    }
  }, [dispatch, id]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!selectedUser) {
    return <p>No user found.</p>;
  }

  return (
    <div className="user-details-container">
      <div className="user-details">
        <Avatar src={selectedUser.img} alt={selectedUser.name} className="user-avatar" />
        <div>
          <Typography variant="h4" className="user-name">{selectedUser.name}</Typography>
          <Typography variant="body1" className="user-email">Email: {selectedUser.email}</Typography>
          <Typography variant="body1" className="user-role">Role: {selectedUser.role}</Typography>
        </div>
      </div>
      <div className="logs-container">
        <Typography variant="h5" className="logs-title">Logs</Typography>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <Box key={index} className="log-entry">
              <Typography variant="body2">{log.action}</Typography>
              <Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography>
            </Box>
          ))
        ) : (
          <p>No logs available for this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
