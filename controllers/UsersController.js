/* eslint-disable */
import SHA1 from 'sha1';
import dbClient from '../utils/db';
import Helper from './utils';

class UsersController {

  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    } else if (!password) {
      res.status(400).json({ error: 'Missing password' });
    } else {
      const shaiPS = SHA1(password);
      const exist = await dbClient.getUsers(email);
      if (exist) {
        res.status(400).json({ error: 'Already exist' });
      } else {
        const inserted = await dbClient.addUsers(email, shaiPS);
        res.status(201).json({ id: inserted, email });
      }
    }
  }

  static async delUser(req, res) {
    const { email } = req.body;
    if (email) {
      const deleted = await dbClient.deleteUsers(email);
      if (deleted) {
        res.status(200).json({ 'deleted email': email });
        return;
      }
    }
    res.status(404).json({ "can't delate email": email });
  }

  static async getMe(req, res) {
      const user = req.user;
      res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

export default UsersController;
