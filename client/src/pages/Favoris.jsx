import React, { useState , useEffect } from 'react';
import {Link} from 'react-router-dom';
import '../styles/favoris.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Favoris = () => {

    const user = useSelector((state) => state.user?.user); // Assuming user details include role
    const navigate = useNavigate();

    useEffect(() => {
   
        const allowedRoles = ['client','responsable energie']; // Define appropriate roles that can access
        if (!allowedRoles.includes(user?.role)) {
            navigate('/error'); // Redirect to the Error page
        }
      }, [user, navigate]);
      
    return (
        <div className="favoris-page">
            <div className="favoris-container">
                <div className="favoris-header">
                    <h1>Manuel HSE</h1>
                    <p>Le manuel HSE est un document qui contient les politiques et les procédures
                        de l'entreprise en matière de santé, sécurité et environnement.</p>
                </div>
                <div className="pdf-viewer">
                    <iframe width="1000px" height="1000px" src="./data/Manuel.pdf" title="title"></iframe>
                </div>
            </div>
        </div>

    )
};

export default Favoris;
