import React, {  useEffect } from "react";
import '../styles/depcom.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DepComercial = () => {
  const user = useSelector((state) => state.user?.user); // Assuming user details include role
  const navigate = useNavigate();

  useEffect(() => {
   
    const allowedRoles = ['chef service hse','responsable commercial']; // Define appropriate roles that can access
    if (!allowedRoles.includes(user?.role)) {
      navigate('/error'); // Redirect to the Error page
    }
  }, [user, navigate]);

  return (
    <div className="DepComercial-container">
      <h1 className="DepComercial-title">Département Commercial</h1>
      <iframe
        className="DepComercial-iframe"
        title="Rapport Power BI - Département Commercial"
        src="https://app.powerbi.com/view?r=eyJrIjoiZGVlMGJmNDEtYTk3NC00NGIxLThlNWEtOGJmZjM4ZTE3MzU5IiwidCI6ImI4NTY2MGE4LWZlN2YtNGYwOS05NTY0LTQwMjYxZDE2ODM4NCJ9"
        width="1140"
        height="541.25"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  );
};

export default DepComercial;