import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; 
import axios from "axios";
import "../styles/commandes.css";

async function OrderUser(currentUserOrder) {
  const orderDetails = [];

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

async function FetchArticle(idarticle) {
  try {
    const result = await axios.get(`http://localhost:5000/article/articles/${idarticle}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching order ${idarticle}:`, error);
  }
}

function Commandes() {
  const [orders, setOrders] = useState([]);
  const [articles, setArticles] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const [languageData, setLanguageData] = useState({});
  const location = useLocation();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await OrderUser(user?.orders);
        setOrders(orders);

        const articleIds = orders.flatMap(order =>
          order.Orders.flatMap(subOrder =>
            subOrder.Articles.map(article => article.articleId)
          )
        );

        const orderArticleInfo = await Promise.all(
          articleIds.map(async (articleId) => {
            return await FetchArticle(articleId);
          })
        );

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

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    orders.forEach((order, index) => {
      doc.text(`Order ${index + 1}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Order ID: ${order._id}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Order Address: ${order.orderaddress}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Order Phone: ${order.orderPhone}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Order Price: ${order.OrderPrice}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Order Status: ${order.OrderStatus}`, 10, yOffset);
      yOffset += 10;

      order.Orders.forEach((subOrder, subIndex) => {
        doc.text(`  Sub Order ${subIndex + 1}`, 10, yOffset);
        yOffset += 10;
        doc.text(`  Sub Order ID: ${subOrder._id}`, 10, yOffset);
        yOffset += 10;
        doc.text(`  Sub Order Price: ${subOrder.OrderPrice}`, 10, yOffset);
        yOffset += 10;
        doc.text(`  Sub Order Status: ${subOrder.OrderStatus}`, 10, yOffset);
        yOffset += 10;
        doc.text(`  Restaurant ID: ${subOrder.subOrderId}`, 10, yOffset);
        yOffset += 10;

        subOrder.Articles.forEach(article => {
          const articleInfo = articles.find(item => item._id === article.articleId);
          doc.text(`    Article ID: ${article.articleId}`, 10, yOffset);
          yOffset += 10;
          doc.text(`    Article Name: ${articleInfo ? articleInfo.name : 'N/A'}`, 10, yOffset);
          yOffset += 10;
          doc.text(`    Article Price: ${articleInfo ? articleInfo.price : 'N/A'}`, 10, yOffset);
          yOffset += 10;
          doc.text(`    Quantity: ${article.quantity}`, 10, yOffset);
          yOffset += 10;
        });
      });

      yOffset += 10; // Add extra space between orders
    });

    doc.save('orders.pdf');
  };

  return (
    <div className="wrapper">
      <h3> {languageData.Commandes || 'Order'} </h3>
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
              <h5>Sub Orders:</h5>
              {order.Orders && order.Orders.length > 0 ? (
                order.Orders.map((subOrder, subIndex) => (
                  <div key={subIndex}>
                    <h6>Sub Order {subIndex + 1}</h6>
                    <p>Sub Order ID: {subOrder._id}</p>
                    <p>Sub Order Price: {subOrder.OrderPrice}</p>
                    <p>Sub Order Status: {subOrder.OrderStatus}</p>
                    <p>Restaurant ID: {subOrder.subOrderId}</p>
                    <h6>Articles:</h6>
                    {subOrder.Articles && subOrder.Articles.length > 0 ? (
                      subOrder.Articles.map((article, articleIndex) => (
                        <div key={articleIndex}>
                          {articles.find(item => item._id === article.articleId) ? (
                            <>
                              <p>Article Name: {articles.find(item => item._id === article.articleId).name}</p>
                              <p>Article Price: {articles.find(item => item._id === article.articleId).price}</p>
                            </>
                          ) : (
                            <p>Article details not found...</p>
                          )}
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
            </div>
          ))
        )}
      </div>
      <button onClick={downloadPDF}>Download as PDF</button>
    </div>
  );
}

export default Commandes;
