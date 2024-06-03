import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import '../styles/commandes.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, userEdit, userDelete, userAdd } from '../redux/slice/userSlice.js';


function Commandes() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const currentUser = useSelector((state) => state.user?.user);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user?.user); // Assuming user details include role
  const navigate = useNavigate();

  // Check for permission
  useEffect(() => {
    const allowedRoles = ['client','responsable erp','admin']; // Define appropriate roles that can access
    if (currentUser && !allowedRoles.includes(currentUser.role)) {
        navigate('/error');
    } else {
        dispatch(fetchAllUsers());
    }
  });


  return (
    <div className="wrapper">
      <h3>Commandes</h3>

      
      
    </div>
  );
}

export default Commandes;
