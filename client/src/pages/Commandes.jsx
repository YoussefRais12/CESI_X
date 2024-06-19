import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; 
import axios from "axios";
import "../styles/commandes.css";
import ViewPaymentDialog from "../components/ViewPaymentDialog";

async function fetchOrdersByUserRole(user) {
  let orderDetails = [];

  if (user && user.orders) 
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

async function FetchMenu(idMenu) {
  try {
    const result = await axios.get(`http://localhost:5000/menu/${idMenu}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching menu ${idMenu}:`, error);
  }
}

function Commandes() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]); 
  const [articles, setArticles] = useState([]);
  const [menus, setMenus] = useState([]);
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

        const menuIds = orders.flatMap(order =>
          order.Orders.flatMap(subOrder =>
            subOrder.Menus.map(menu => menu.menuId)
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

        const orderMenuInfo = await Promise.all(
          menuIds.map(async (menuId) => {
            return await FetchMenu(menuId);
          })
        );

        setRestaurants(orderRestaurantInfo);
        setArticles(orderArticleInfo);
        setMenus(orderMenuInfo);
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
      {orders.filter(order => order.OrderStatus === "en cours").length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div>
            <h4>Orders in Progress</h4>
            {orders.filter(order => order.OrderStatus === "en cours").map((order, index) => (
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
                      {subOrder.Menus && subOrder.Menus.length > 0 && (
                        <>
                          <h6>Menus:</h6>
                          {subOrder.Menus.map((menu, menuIndex) => (
                            <div key={menuIndex}>
                              <p>Menu Name: {menus.find(item => item._id === menu.menuId)?.name || 'N/A'}</p>
                              <p>Menu Price: {menus.find(item => item._id === menu.menuId)?.price || 'N/A'}</p>
                              <p>Quantity: {menu.quantityMenu}</p>
                              <h6>Menu Articles:</h6>
                              {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                <div key={menuArticleIndex}>
                                  <p>Article Name: {menuArticle?.name || 'N/A'}</p>
                                  <p>Article Price: {menuArticle?.price || 'N/A'}</p>
                                </div>
                              ))}
                            </div> 
                          ))}
                        </>
                      )}
                      {subOrder.Articles && subOrder.Articles.length > 0 && (
                        <>
                          <h6>Articles:</h6>
                          {subOrder.Articles.map((article, articleIndex) => (
                            <div key={articleIndex}>
                              <p>Article Name: {articles.find(item => item._id === article.articleId)?.name || 'N/A'}</p>
                              <p>Article Price: {articles.find(item => item._id === article.articleId)?.price || 'N/A'}</p>
                              <p>Quantity: {article.quantity}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No sub-orders found.</p>
                )}
                <button onClick={() => PayOrder(order)}>Pay Order</button>
                <button onClick={() => deleteOrder(order)}>Delete Order</button>
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

export default Commandes;
