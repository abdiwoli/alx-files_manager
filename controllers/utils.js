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
      return { user, key };
    }
  }

  static async getFilesWithPagination(userId, parentId, skip, limit) {
    try {
      const collection = await dbClient.client.db().collection('files');

      console.log('Query Parameters:', {
        userId, parentId, skip, limit,
      });

      const results = await collection.aggregate([
        { $match: { parentId, userId } },
        { $skip: skip },
        { $limit: limit },
      ]).toArray();
      console.log('Files Found:', results);
      return results;
    } catch (error) {
      console.error('Error retrieving files with pagination:', error);
      throw error;
    }
  }
}

export default Helper;
