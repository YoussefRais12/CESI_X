import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "../styles/commandes.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Order from '../class/order';

function Commandes() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const currentUser = useSelector((state) => state.user?.user);
  const dispatch = useDispatch();
  const location = useLocation();

  const [languageData, setLanguageData] = useState({});
  const user = useSelector((state) => state.user?.user); // Assuming user details include role
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  



  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get("lang") || "fr";
    import(`../lang/${lang}.json`)
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error("Let's try again buddy:", error);
      });
  }, [location.search]);

  return (
    <div className="wrapper">
      <h3> {languageData.Commandes || 'order'} </h3>
    </div>
  );
}

export default Commandes;
