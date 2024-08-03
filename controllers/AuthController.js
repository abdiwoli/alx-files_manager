/* eslint-disable */
import { v4 } from 'uuid';
import auth from 'basic-auth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Helper from './utils';

class AuthController {
  static async getConnect(req, res) {
    const user = auth(req);

    if (!user || !user.name || !user.pass) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name: email, pass: password } = user;

    if (email && password) {
      const exist = await dbClient.getUsers(email);
      if (exist) {
        const token = v4();
        const key = `auth_${token}`;
        await redisClient.set(key, exist._id.toString(), 86400);
        return res.status(200).json({ token });
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }

    static async getDisconnect(req, res) {
      const data = await Helper.getByToken(req, res);
      if (data.user) {
        const { user, key } = data;
        await redisClient.del(key);
        res.status(204);
        res.end();
      } else {
          res.status(401).json({ error: 'Unauthorized' });
      }
    }
}

export default AuthController;
