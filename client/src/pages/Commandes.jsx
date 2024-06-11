import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "../styles/commandes.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Order from '../class/order';
import axios from "axios";

async function OrderUser(currentUserOrder) {
  const orderDetails = [];
  console.log(currentUserOrder);

  // Assurez-vous que currentUserOrder est toujours un tableau
  if (!Array.isArray(currentUserOrder)) {
    currentUserOrder = [currentUserOrder];
  }

  for (const orderId of currentUserOrder) {
    try {
      const result = await axios.get(`http://localhost:5000/order/${orderId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      orderDetails.push(result.data);
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
    }
  }
  return orderDetails;
}

function Commandes() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [orders, setOrders] = useState([]); // État pour stocker les commandes
  const currentUser = useSelector((state) => state.user?.user);
  const dispatch = useDispatch();
  const location = useLocation();

  const [languageData, setLanguageData] = useState({});
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    async function fetchOrders() {
      const orders = await OrderUser(user?.orders);
      setOrders(orders);
    }
    fetchOrders();
  }, [user?.orders]);
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get("lang") || "fr";
    import(`../lang/${lang}.json`)
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error("Error loading language file:", error);
      });
  }, [location.search]);
  console.log(orders)
  return (
    <div className="wrapper">
      <h3> {languageData.Commandes || 'order'} </h3>
      <div>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div key={index}>
              <h4>Order {index + 1}</h4>
              <p>Order ID: {order._id}</p>
              <p>Order Address: {order.orderaddress}</p>
              <p>Order Phone: {order.orderPhone}</p>
              <p>Order Price: {order.OrderPrice}</p>
              <p>Order Status: {order.OrderStatus}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Commandes;
