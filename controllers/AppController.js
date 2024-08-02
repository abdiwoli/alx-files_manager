/* eslint-disable */
import  redisClient  from '../utils/redis';
import  dbClient  from '../utils/db';

class AppController {
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static getStats(req, res) {
    let cUsers;
    let cFiles;
    (async () => {
      cUsers = await dbClient.nbUsers();
      cFiles = await dbClient.nbFiles();
      res.status(200).json({ users: cUsers, files: cFiles });
    })();
  }
}

export default AppController;
