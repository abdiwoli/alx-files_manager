/* eslint-disable */

import { v4 } from 'uuid';
import auth from 'basic-auth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class Helper {
  static async getByToken(req, res) {
    const token = req.headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const user = await dbClient.getUsersById(userId);
        if (user && user._id.toString() === userId){
            return { error:false, user, key };
        }
    }
      return {error:true};
  }

  static async getFilesWithPagination(query) {
    try {
        const collection = await dbClient.client.db().collection('files');
        const results = await collection.aggregate(query).toArray()
      return results;
    } catch (error) {
      console.error('Error retrieving files with pagination:', error);
      throw error;
    }
  }
}

export default Helper;
