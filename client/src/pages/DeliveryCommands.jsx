import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/commandes.css";

async function fetchAllOrders() {
  try {
    const result = await axios.get("http://localhost:5000/order/all-orders", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
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
    return null;
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
    return null;
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
    return null;
  }
}

function DeliveryCommands() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [articles, setArticles] = useState([]);
  const [menus, setMenus] = useState([]);
  const location = useLocation();
  const [languageData, setLanguageData] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await fetchAllOrders();
        setOrders(orders);

        const articleIds = orders.flatMap(order =>
          order.Orders?.flatMap(subOrder =>
            subOrder.Articles?.map(article => article.articleId) || []
          ) || []
        );

        const menuIds = orders.flatMap(order =>
          order.Orders?.flatMap(subOrder =>
            subOrder.Menus?.map(menu => menu.menuId) || []
          ) || []
        );

        const orderRestaurantInfo = await Promise.all(
          orders.flatMap(order =>
            order.Orders?.map(subOrder => subOrder.restaurantId) || []
          ).map(async restaurantId => {
            const restaurant = await FetchRestaurant(restaurantId);
            return { id: restaurantId, name: restaurant?.name || 'Unknown' };
          })
        );

        const orderArticleInfo = await Promise.all(
          articleIds.map(async (articleId) => {
            const article = await FetchArticle(articleId);
            return article;
          })
        );

        const orderMenuInfo = await Promise.all(
          menuIds.map(async (menuId) => {
            const menu = await FetchMenu(menuId);
            return menu;
          })
        );

        setRestaurants(orderRestaurantInfo.filter(Boolean));
        setArticles(orderArticleInfo.filter(Boolean));
        setMenus(orderMenuInfo.filter(Boolean));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
  }, []);

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

  return (
    <div className="wrapper">
      <h3>{languageData.Commandes || 'Orders'}</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div>
            <h4>All Orders</h4>
            {orders.map((order, index) => (
              <div key={index} className="order">
                <h5>Order {index + 1}</h5>
                <p>Order ID: {order._id}</p>
                <p>Order Address: {order.orderaddress}</p>
                <p>Order Phone: {order.orderPhone}</p>
                <p>Order Price: {order.OrderPrice}</p>
                <p>Order Status: {order.OrderStatus}</p>
                <h6>Sub Orders:</h6>
                {order.Orders && order.Orders.length > 0 ? (
                  order.Orders.map((subOrder, subIndex) => (
                    <div key={subIndex}>
                      <h6>Sub Order: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</h6>
                      <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</p>
                      <p>Sub Order Price: {subOrder.OrderPrice}</p>
                      <p>Sub Order Status: {subOrder.OrderStatus}</p>
                      {subOrder.Menus && subOrder.Menus.length > 0 && (
                        <>
                          <h6>Menus:</h6>
                          {subOrder.Menus.map((menu, menuIndex) => (
                            <div key={menuIndex}>
                              <p>Menu Name: {menus.find(item => item._id === menu.menuId)?.name || 'Unknown'}</p>
                              <p>Menu Price: {menus.find(item => item._id === menu.menuId)?.price || 'Unknown'}</p>
                              <p>Quantity: {menu.quantityMenu}</p>
                              <h6>Menu Articles:</h6>
                              {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                <div key={menuArticleIndex}>
                                  <p>Article Name: {menuArticle?.name || 'Unknown'}</p>
                                  <p>Article Price: {menuArticle?.price || 'Unknown'}</p>
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
                              <p>Article Name: {articles.find(item => item._id === article.articleId)?.name || 'Unknown'}</p>
                              <p>Article Price: {articles.find(item => item._id === article.articleId)?.price || 'Unknown'}</p>
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DeliveryCommands;
