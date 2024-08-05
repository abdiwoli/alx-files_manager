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
        const results = await collection.aggregate(query).toArray();
        const arr = [];
        results.forEach(file => {
            arr.push(Helper.fileToReturn(file));
        });
      return arr;
    } catch (error) {
      console.error('Error retrieving files with pagination:', error);
      throw error;
    }
  }

    static fileToReturn(file){
        if (file.parentId && file.parentId === "0"){
            file.parentId = 0;
        }
        const edited = {id:file._id, ...file};
        delete edited._id;
        if (file.type === "folder")
            return edited;
        delete edited.localPath
        return edited;
    }

    static async authUser(req, res, next) {
        const data = await Helper.getByToken(req, res);
        if (data && data.error){
            return res.status(401).json({error:"Unauthorized"});
        }
        else {
            req.user = data.user;
            req.key = data.key;
            next();
        }
        
    }
}

export default Helper;
