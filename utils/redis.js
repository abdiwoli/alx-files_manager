/* eslint-disable */
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor () {
    this.client = createClient();
    this.connected = true;
    this.setex = promisify(this.client.SETEX).bind(this.client);
    this.get = promisify(this.client.GET).bind(this.client);
    this.del = promisify(this.client.DEL).bind(this.client);
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => { this.connected = true; });
  }

  isAlive () {
    return this.connected;
  }

  async set (key, value, duration) {
    try {
      await this.setex(key, duration, value);
    } catch (err) {
      console.error('Error setting value:', err);
      throw err;
    }
  }

  async get (key) {
    try {
      return await this.get(key);
    } catch (err) {
      console.error('Error retrieving value:', err);
      throw err;
    }
  }

  async del (key) {
    try {
      return await this.del(key);
    } catch (err) {
      console.error('Error deleting key:', err);
      throw err;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
