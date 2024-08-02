/* eslint-disable */
import SHA1 from 'sha1';
import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
import Helper from './utils';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const users = await Helper.getByToken(req, res);
    if (users && users.user) {
      const files = await dbClient.client.db().collection('files');
      const { FOLDER_PATH = '/tmp/files_manager' } = process.env;
      const { user } = users;

      const {
        name, type, parentId = '0', isPublic = false, data,
      } = req.body;
      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!type) return res.status(400).json({ error: 'Missing type' });
      if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
      if (parentId && parentId !== '0') {
        console.log(parentId);
        const file = await dbClient.getFileParent(parentId);
        if (!file) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (file && file.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
      }

      if (type === 'folder') {
        const result = await files.insertOne({
          userId: user._id.toString(),
          name,
          type,
          isPublic,
          parentId,
        });

        if (result.insertedId) {
          const newFile = await files.findOne({ _id: result.insertedId });
          return res.status(201).json(newFile);
        }
      } else {
        if (!fs.existsSync(FOLDER_PATH)) {
          fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }

        const fileId = v4();
        const filePath = path.join(FOLDER_PATH, fileId);
        const fileData = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, fileData);

        const result = await files.insertOne({
          userId: user._id.toString(),
          name,
          type,
          isPublic,
          parentId,
          localPath: filePath,
        });

        console.log(result);

        if (result.insertedId) {
          const newFile = await files.findOne({ _id: result.insertedId });
          return res.status(201).json(newFile);
        }

        res.end('failed to create');
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }

  static async getShow(req, res) {
    const users = await Helper.getByToken(req, res);
    if (users && users.user) {
      const fileId = req.params.id;
      const userId = users.user._id;
      const file = await db.getFile(fileId);
      if (file && file.userId === userId) {
        return res.status(200).json(file);
      }
      res.status(404).json({ error: 'Not found' });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }

  static async getIndex(req, res) {
    try {
      const users = await Helper.getByToken(req, res);
      if (!users || !users.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = users.user._id.toString();
      const { parentId = 0, page = 0 } = req.query;

      console.log({ userId, parentId, page });
      const pageNumber = parseInt(page, 10);

      if (isNaN(pageNumber) || pageNumber < 0) {
        return res.status(400).json({ error: 'Invalid page number' });
      }

      const limit = 20;
      const skip = pageNumber * limit;

      const files = await Helper.getFilesWithPagination(userId, parentId, skip, limit);
      console.log(files);
      return res.status(200).json(files);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
