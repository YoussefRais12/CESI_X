import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; 
import axios from "axios";
import "../css/commandes.css";
import ViewPaymentDialog from "../components/ViewPaymentDialog";

async function fetchOrdersByUserRole(user) {
  let orderDetails = [];

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

  return orderDetails;
}

async function FetchArticle(idarticle) {
  try {
    const result = await axios.get(`http://localhost:5000/article/articles/${idarticle}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching article ${idarticle}:`, error);
  }
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

function Commandes() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]); 
  const [articles, setArticles] = useState([]);
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

        const articleIds = orders.flatMap(order =>
          order.Orders.flatMap(subOrder =>
            subOrder.Articles.map(article => article.articleId)
          )
        );

        const orderRestaurantInfo = await Promise.all(
          orders.flatMap(order =>
            order.Orders.map(subOrder => subOrder.restaurantId)
          ).map(async restaurantId => {
            const restaurant = await FetchRestaurant(restaurantId);
            return { id: restaurantId, name: restaurant.name };
          })
        );

        const orderArticleInfo = await Promise.all(
          articleIds.map(async (articleId) => {
            return await FetchArticle(articleId);
          })
        );

        setRestaurants(orderRestaurantInfo);
        setArticles(orderArticleInfo);
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

  const downloadPDF = (order) => {
    const doc = new jsPDF();
    let yOffset = 10;
    doc.text(`Order ${1}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Order Address: ${user.address}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Order Phone: ${user.phoneNumber}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Order Price: ${order.OrderPrice}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Order Status: ${order.OrderStatus}`, 10, yOffset);
    yOffset += 10;

    order.Orders.forEach((subOrder, subIndex) => {
      doc.text(`  Sub Order ${subIndex + 1}`, 10, yOffset);
      yOffset += 10;
      const restaurantInfo = restaurants.find(r => r.id === subOrder.restaurantId);
      doc.text(`  Restaurant Name: ${restaurantInfo ? restaurantInfo.name : 'N/A'}`, 10, yOffset);
      yOffset += 10;
      doc.text(`  Sub Order Price: ${subOrder.OrderPrice}`, 10, yOffset);
      yOffset += 10;
      doc.text(`  Sub Order Status: ${subOrder.OrderStatus}`, 10, yOffset);
      yOffset += 10;

      subOrder.Articles.forEach(article => {
        const articleInfo = articles.find(item => item._id === article.articleId);
        doc.text(`    Article Name: ${articleInfo ? articleInfo.name : 'N/A'}`, 10, yOffset);
        yOffset += 10;
        doc.text(`    Article Price: ${articleInfo ? articleInfo.price : 'N/A'}`, 10, yOffset);
        yOffset += 10;
        doc.text(`    Quantity: ${article.quantity}`, 10, yOffset);
        yOffset += 10;
      });
    });

    yOffset += 10;

    doc.save('orders.pdf');
  };

  const deleteOrder = async (order) => {
    if (!order) {
      console.error('No order to delete');
      return;
    }
    try {
      const result = await axios.delete(`http://localhost:5000/order/${order._id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      console.log('Order deleted successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting order:', error);
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
      <h3>{languageData.Commandes || 'Order'}</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div>
            <h4>Orders in Progress</h4>
            {orders.map((order, index) => (
              order.OrderStatus === "en cours" && (
                <div key={index} className="order-in-progress">
                  <h5>Order {index + 1}</h5>
                  <p>Order ID: {order._id}</p>
                  <p>Order Address: {user.address}</p>
                  <p>Order Phone: {user.phoneNumber}</p>
                  <p>Order Price: {order.OrderPrice}</p>
                  <p>Order Status: {order.OrderStatus}</p>
                  <h6>Sub Orders:</h6>
                  {order.Orders && order.Orders.length > 0 ? (
                    order.Orders.map((subOrder, subIndex) => (
                      <div key={subIndex}>
                        <h6>Sub Order : {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</h6>
                        <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</p>
                        <p>Sub Order Price: {subOrder.OrderPrice}</p>
                        <p>Sub Order Status: {subOrder.OrderStatus}</p>
                        <h6>Articles:</h6>
                        {subOrder.Articles && subOrder.Articles.length > 0 ? (
                          subOrder.Articles.map((article, articleIndex) => (
                            <div key={articleIndex}>
                              <p>Article Name: {articles.find(item => item._id === article.articleId)?.name || 'N/A'}</p>
                              <p>Article Price: {articles.find(item => item._id === article.articleId)?.price || 'N/A'}</p>
                              <p>Quantity: {article.quantity}</p>
                            </div>
                          ))
                        ) : (
                          <p>No articles found.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No sub-orders found.</p>
                  )}
                  <button onClick={() => downloadPDF(order)}>Download as PDF</button>
                  <button onClick={() => PayOrder(order)}>Pay Order</button>
                  <button onClick={() => deleteOrder(order)}>Delete Order</button>
                </div>
              )
            ))}
          </div>
          <hr /> 
          <div>
            <h4>Paid Orders</h4>
            {orders.map((order, index) => (
              order.OrderStatus !== "en cours" && (
                <div key={index} className="order-paid">
                  <h5>Order {index + 1}</h5>
                  <p>Order ID: {order._id}</p>
                  <p>Order Address: {user.address}</p>
                  <p>Order Phone: {user.phoneNumber}</p>
                  <p>Order Price: {order.OrderPrice}</p>
                  <p>Order Status: {order.OrderStatus}</p>
                  <h6>Sub Orders:</h6>
                  {order.Orders && order.Orders.length > 0 ? (
                    order.Orders.map((subOrder, subIndex) => (
                      <div key={subIndex}>
                        <h6>Sub Order : {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</h6>
                        <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</p>
                        <p>Sub Order Price: {subOrder.OrderPrice}</p>
                        <p>Sub Order Status: {subOrder.OrderStatus}</p>
                        <h6>Articles:</h6>
                        {subOrder.Articles && subOrder.Articles.length > 0 ? (
                          subOrder.Articles.map((article, articleIndex) => (
                            <div key={articleIndex}>
                              <p>Article Name: {articles.find(item => item._id === article.articleId)?.name || 'N/A'}</p>
                              <p>Article Price: {articles.find(item => item._id === article.articleId)?.price || 'N/A'}</p>
                              <p>Quantity: {article.quantity}</p>
                            </div>
                          ))
                        ) : (
                          <p>No articles found.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No sub-orders found.</p>
                  )}
                  <button onClick={() => downloadPDF(order)}>Download as PDF</button>
                </div>
              )
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

export default Commandes;
