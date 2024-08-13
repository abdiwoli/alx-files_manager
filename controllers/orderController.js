import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class Orders {
    static async postOrders(orderId, userId, data) {
        try {
            const ordersCollection = dbClient.client.db().collection('orders');
            const order = {
                orderId,
                userId,
                status:"uncomplete",
                ...data
            };
            const result = await ordersCollection.insertOne(order);
            return result.insertedId;
        } catch (error) {
            console.error('Error inserting order:', error);
            throw error;
        }
    }

    static async orderStatus(orderId, status) {
        try {
            const ordersCollection = dbClient.client.db().collection('orders');            
            const result = await ordersCollection.updateOne(
                { orderId: orderId },
                { $set: { status: status } }
            );
            if (result.matchedCount === 0) {
                return { success: false, message: 'Order not found' };
            }
            return { success: true, message: 'Order status updated' };
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, message: 'Error updating order status' };
        }
    }

    static async getOrders(req, res){
        const user = req.user;
        const collection = await dbClient.client.db().collection('orders');
        const orders = await collection.find({userId: user.id}).toArray();
        res.status(200).json(orders);
    }
}

export default Orders;
