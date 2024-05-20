import React, { useState , useEffect } from 'react';
import {Link} from 'react-router-dom';
import '../styles/hse.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Hse = () => {
    const [pdfOpen,
        setPdfOpen] = useState(false);

    const pdfSrc = './data/Manuel.pdf';

    const handlePdfClick = () => {
        setPdfOpen(true);
    };

    const handleBackButtonClick = () => {
        setPdfOpen(false);
    };

    const user = useSelector((state) => state.user?.user); // Assuming user details include role
    const navigate = useNavigate();

    useEffect(() => {
   
        const allowedRoles = ['chef service hse','responsable energie']; // Define appropriate roles that can access
        if (!allowedRoles.includes(user?.role)) {
            navigate('/error'); // Redirect to the Error page
        }
      }, [user, navigate]);
      
    return (
        <div className="hse-page">
            <div className="hse-container">
                <div className="hse-header">
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

export default Hse;
