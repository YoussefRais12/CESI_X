import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const API_URL = (window.location.host).split(":")[0];

async function fetchDeliveredOrders(user) {
  let deliveredOrders = [];

  if (user && user.orders) {
    if (user.role === "restaurantOwner") {
      try {
        const result = await axios.get(`http://${API_URL}:5000/restaurant/owner/${user._id}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        const restaurants = result.data;

        for (const restaurant of restaurants) {
          for (const subOrderId of restaurant.subOrders) {
            const orderResult = await axios.get(`http://${API_URL}:5000/order/suborder/${subOrderId}`, {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            });
            const order = orderResult.data;
            if (order.Orders.some(subOrder => subOrder.OrderStatus === "delivered")) {
              deliveredOrders.push(order);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching delivered orders for restaurants owned by ${user._id}:`, error);
      }
    } else {
      if (!Array.isArray(user.orders)) {
        user.orders = [user.orders];
      }

      for (const orderId of user.orders) {
        try {
          const result = await axios.get(`http://${API_URL}:5000/order/${orderId}`, {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          });
          if (result.data.OrderStatus === "delivered") {
            deliveredOrders.push(result.data);
          }
        } catch (error) {
          console.error(`Error fetching order ${orderId}:`, error);
        }
      }
    }
  }

  return deliveredOrders;
}

function FinancialDashboard() {
  const [orders, setOrders] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const location = useLocation();
  const [languageData, setLanguageData] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const deliveredOrders = await fetchDeliveredOrders(user);
        setOrders(deliveredOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
  }, [user]);

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

  const totalRevenue = orders.reduce((acc, order) => acc + order.OrderPrice, 0);
  const data = {
    labels: orders.map((order, index) => `Order ${index + 1}`),
    datasets: [
      {
        label: languageData.revenue || 'Revenue',
        data: orders.map(order => order.OrderPrice),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard">
      <h3>{languageData.financialDashboard || 'Financial Dashboard'}</h3>
      <div className="dashboard-content">
        <div className="dashboard-summary">
          <h4>{languageData.totalRevenue || 'Total Revenue'}: {totalRevenue} €</h4>
        </div>
        <div className="dashboard-chart">
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}

export default FinancialDashboard;
