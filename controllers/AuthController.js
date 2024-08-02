/* eslint-disable */

import { v4 } from 'uuid';
import auth from 'basic-auth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Helper from './utils';

class AuthController {
  static async getConnect(req, res) {
    const user = auth(req);
    const { name: email, pass: password } = auth(req);
    if (email && password) {
      const exist = await dbClient.getUsers(email);
      if (exist) {
        const token = v4();
        const key = `auth_${token}`;
        await redisClient.set(key, exist._id.toString(), 86400);
        res.status(200).json({ token });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }

  static async getDisconnect(req, res) {
    const data = await Helper.getByToken(req, res);
    if (data) {
      const { user, key } = data;
      await redisClient.del(key);
      res.status(204);
      res.end();
    } else { res.status(401).json({ error: 'Unauthorized' }); }
  }
}

export default AuthController;
