import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import '../styles/commandes.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Commandes() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);

  const user = useSelector((state) => state.user?.user); // Assuming user details include role
  const navigate = useNavigate();

  
  // Check for permission
  useEffect(() => {
   
    const allowedRoles = ['client','responsable erp']; // Define appropriate roles that can access
    if (!allowedRoles.includes(user?.role)) {
      navigate('/error'); // Redirect to the Error page
    }
  }, [user, navigate]);


  return (
    <div className="wrapper">
      <h3>Commandes</h3>

      
      
    </div>
  );
}

export default Commandes;
