/* eslint-disable */
const { MongoClient, ObjectId } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const db = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;
    const uri = `mongodb://${host}:${port}/${db}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.on('error', () => {
      this.connected = false;
    });

    this.client.on('connect', () => {
      this.connected = true;
    });

    this.connect();
  }

  isAlive() {
    return this.connected;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      this.connected = true;
    } catch (err) {
      console.log(err);
    }
  }

    async nbUsers() {
        const count = await this.db.collection('users').countDocuments();
        return count;
    }

    async nbFiles() {
        const count = await this.db.collection('files').countDocuments();
        return count;
    }

    async getUsers(email) {
        const user = await this.db.collection('users').findOne({ email: email });
        return user;
    }

    async deleteUsers(email) {
        const deleteResult = await this.db.collection('users').deleteOne({ email: email });
        return deleteResult.deletedCount;;
    }

    async addUsers(email, password) {
        const added = await this.db.collection('users').insertOne({email, password});
        return added.insertedId;
    }

    /* eslint-disable */
    async getUsersById(userId) {
        const id = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
        const user = await this.db.collection('users').findOne({ _id: id });
        return user;
    }

    async getFileParent(parentId) {
        try{
            const id = ObjectId.isValid(parentId) ? new ObjectId(parentId) : parentId;
            const file = await this.db.collection('files').findOne({ _id: id });
            return file;
        } catch  {
            return null;
        }
    }

    async getFileByUser(userId){
        const file = await this.db.collection('files').findOne({userId: userId });
        return file;
    }

    async getFile(fileId){
        const id = ObjectId.isValid(fileId) ? new ObjectId(fileId) : fileId;
        const file = await this.db.collection('files').findOne({_id: id });
        return file;
    }
    
}

const dbClient = new DBClient();
export default dbClient;
