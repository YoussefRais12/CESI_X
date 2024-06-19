import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/commandes.css";
import ViewPaymentDialog from "../components/ViewPaymentDialog";

async function fetchOrdersByUserRole(user) {
  let orderDetails = [];

  if (user && user.orders) {
    if (user.role === "restaurantOwner") {
      try {
        const result = await axios.get(`http://localhost:5000/restaurant/owner/${user._id}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        const restaurants = result.data;

        for (const restaurant of restaurants) {
          for (const subOrderId of restaurant.subOrders) {
            const orderResult = await axios.get(`http://localhost:5000/order/suborder/${subOrderId}`, {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            });
            const order = orderResult.data;
            if (order.Orders.some(subOrder => subOrder.OrderStatus === "en cours")) {
              orderDetails.push(order);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching orders for restaurants owned by ${user._id}:`, error);
      }
    } else {
      if (!Array.isArray(user.orders)) {
        user.orders = [user.orders];
      }

      for (const orderId of user.orders) {
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
    }
  }

  return orderDetails;
}

async function FetchRestaurant(idRestaurant) {
  try {
    const result = await axios.get(`http://localhost:5000/restaurant/${idRestaurant}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching restaurant ${idRestaurant}:`, error);
  }
}

function RestaurantOrder() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const [languageData, setLanguageData] = useState({});
  const location = useLocation();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await fetchOrdersByUserRole(user);
        setOrders(orders);

        const orderRestaurantInfo = await Promise.all(
          orders.flatMap(order =>
            order.Orders.map(subOrder => subOrder.restaurantId)
          ).map(async restaurantId => {
            const restaurant = await FetchRestaurant(restaurantId);
            return { id: restaurantId, name: restaurant.name };
          })
        );

        setRestaurants(orderRestaurantInfo);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
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

  const acceptOrder = async (subOrder) => {
    console.log(subOrder)
    try {
      const response = await axios.put(`http://localhost:5000/order/accept-suborder/${subOrder.subOrderId._id}`, {}, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        alert('Sub-order accepted successfully!');
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error accepting sub-order:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error accepting sub-order: ${error.response.data.message}`);
      } else {
        alert('An error occurred while accepting the sub-order.');
      }
    }
  };

  const PayOrder = (order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const closePaymentDialog = () => {
    setShowPaymentDialog(false);
  };

  return (
    <div className="wrapper">
      <h3>{languageData.Commandes || 'Orders'}</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div>
            <h4>Orders in Progress</h4>
            {orders.filter(order => order.OrderStatus !== "en cours").map((order, index) => (
              <div key={index} className="order-in-progress">
                <h5>Order {index + 1}</h5>
                <p>Order ID: {order._id}</p>
                <h6>Sub Orders:</h6>
                {order.Orders && order.Orders.length > 0 ? (
                  order.Orders.filter(subOrder => subOrder.OrderStatus === "en cours").map((subOrder, subIndex) => (
                    <div key={subIndex}>
                      <h6>Sub Order : {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</h6>
                      <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</p>
                      <p>Sub Order Price: {subOrder.OrderPrice}</p>
                      <p>Sub Order Status: {subOrder.subOrderId.OrderStatus}</p>
                      {subOrder.Menus && subOrder.Menus.length > 0 && (
                        <>
                          <h6>Menus:</h6>
                          {subOrder.Menus.map((menu, menuIndex) => (
                            <div key={menuIndex}>
                              <p>Menu Name: {menu.name}</p>
                              <p>Menu Price: {menu.price}</p>
                              <p>Quantity: {menu.quantityMenu}</p>
                            </div>
                          ))}
                        </>
                      )}
                      {subOrder.Articles && subOrder.Articles.length > 0 && (
                        <>
                          <h6>Articles:</h6>
                          {subOrder.Articles.map((article, articleIndex) => (
                            <div key={articleIndex}>
                              <p>Article Name: {article.name}</p>
                              <p>Article Price: {article.price}</p>
                              <p>Quantity: {article.quantity}</p>
                            </div>
                          ))}
                        </>
                      )}
                      <button onClick={() => acceptOrder(subOrder)}>Accepter la commande</button>
                    </div>
                  ))
                ) : (
                  <p>No sub-orders found.</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {showPaymentDialog && selectedOrder && (
        <ViewPaymentDialog order={selectedOrder} onClose={closePaymentDialog} />
      )}
    </div>
  );
}

export default RestaurantOrder;
