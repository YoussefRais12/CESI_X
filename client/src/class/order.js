import axios from "axios";
const REACT_APP_API_URL = "http://localhost:5000";

export default class Order {
    orderId;
    orderaddress;
    orderPhone;
    userId;
    DeliveryPersonId;
    orders;
    OrderPrice;
    OrderStatus;
    initialized = false; 

    constructor(orderData) {
        this.initialize(orderData);
    }

    async initialize(orderData) {
        try {
            const result = await Order.addOrderUsingRoute(orderData);
            this.orderId = result.order._id;
            this.orderaddress = result.order.orderaddress;
            this.orderPhone = result.order.orderPhone;
            this.userId = result.order.userId;
            this.DeliveryPersonId = result.order.DeliveryPersonId;
            this.orders = result.order.Orders;
            this.OrderStatus = result.order.OrderStatus;
            this.OrderPrice = result.order.OrderPrice;
            this.initialized = true; 
        } catch (error) {
            throw error;
        }
    }

    checkInitialization() {
        if (!this.initialized) {
            throw new Error('Order not initialized yet');
        }
    }

    getOrderId() {
        this.checkInitialization();
        return this.orderId;
    }

    getorderaddress() {
        this.checkInitialization();
        return this.orderaddress;
    }

    async remove() {
        try {
            this.checkInitialization();
            const apiurl = REACT_APP_API_URL;
            const result = await axios.delete(`${apiurl}/order/${this.getOrderId()}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            console.log(result);
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    async addArticle(articleId, quantity) {
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = { quantity };
            const result = await axios.post(`${apiurl}/order/${this.getOrderId()}/article/${articleId}`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error adding article to order:', error);
            throw error;
        }
    }
    async removeArticle(articleId) {
        try {
            const apiurl = REACT_APP_API_URL;
            const result = await axios.delete(`${apiurl}/order/${this.getOrderId()}/article/${articleId}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error deleting article from order:', error);
            throw error;
        }
    }

    static async addOrderUsingRoute(orderData) {
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = orderData;
            const result = await axios.post(`${apiurl}/order/add`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result.data;
        } catch (error) {
            console.error('Error adding order using route:', error);
            throw error;
        }
    }

    toObject() {
        return {
            orderaddress: this.orderaddress,
            orderPhone: this.orderPhone,
            userId: this.userId,
            DeliveryPersonId: this.DeliveryPersonId,
            Orders: this.orders
        };
    }
}
