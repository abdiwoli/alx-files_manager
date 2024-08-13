import axios  from 'axios';
import dotenv from  'dotenv';
import qs  from 'querystring';
import Orders from '../../controllers/orderController';

dotenv.config();


async function generateAccessToken() {
    try {
        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            method: "post",
            data: qs.stringify({ grant_type: 'client_credentials' }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: process.env.PAYPAL_CLIENT_ID,
                password: process.env.PAYPAL_CLIENT_SECRET
            }
        });
        console.log('data.access_token');
        return response.data.access_token;
    } catch (error) {
        console.error('Error generating access token:', error.response ? error.response.data : error.message);
    }
}

const createOrder = async (orders, userId) => {
    try {
        const token = await generateAccessToken();
        console.log('Access Token:', token);

        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            data: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [ 
                    {
                        description: "Buying from som shop",
                        amount: {
                            currency_code: 'USD',
                            value: orders.totalPrice,
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: orders.totalPrice
                                }
                            }
                        },
                        items: orders.items
                    }
                ],
                application_context: {
                    return_url: `${process.env.BASE_URL}/complete-order`,
                    cancel_url: `${process.env.BASE_URL}/cancel-order`,
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    brand_name: 'SOM'
                }
            })
        });
        try{
            Orders.postOrders(response.data.id, userId, orders) ; 
        }
        catch (err) {
            return "http://localhost:3000/error";
        }
        return response.data.links.find(link => link.rel === 'approve').href;
    } catch (error) {
        console.log(error);
        return error;
    }
};

const capturePayment = async (orderId) => {
    try {
        const token = await generateAccessToken(); 
        const response = await axios({
            method: 'post',
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        const status = response.data.status;
        Orders.orderStatus(orderId, status);
        return response.data;
    } catch (error) {
        console.error('Error capturing payment:', error.response ? error.response.data : error.message);
        throw error; 
    }
};


function formatOrders(ordersArray) {
    // Extract items from the orders array
    const items = ordersArray.map(order => ({
        name: order.name,
        description: order.description.length > 100 ? order.description.substring(0, 100) +'...' : order.description,
        quantity: Number(order.quantity),
        unit_amount: {
            currency_code: 'USD',
            value: Number(order.price).toFixed(2)
        }
    }));
  
    // Sum the totalPrice of each item to get the combined total price
    const totalPrice = ordersArray.reduce((total, order) => total + Number(order.totalPrice), 0).toFixed(2);
  
    // Create the formatted order object
    const formattedOrder = {
        totalPrice: totalPrice,
        items: items
    };
  
    return formattedOrder;
  }


module.exports = { generateAccessToken, createOrder, capturePayment, formatOrders};

