/* eslint-disable */
import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
import mime from 'mime-types';
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
        const file = await dbClient.getFile(parentId);
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
            const edited = {id:newFile._id, ...newFile}
          return res.status(201).json(edited);
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


        if (result.insertedId) {
            const newFile = await files.findOne({ _id: result.insertedId });
            const editedFile = Helper.fileToReturn(newFile);
                
          return res.status(201).json(editedFile);
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
      const file = await dbClient.getFile(fileId);
        if (file && file.userId === userId.toString()) {
            const editedFile = Helper.fileToReturn(file);
        return res.status(200).json(editedFile);
      }
      res.status(404).json({ error: 'Not found' });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }

    static async getIndex(req, res) {
    try {
      const users = await Helper.getByToken(req, res);
      if (users.error) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = users.user._id.toString();
      const { parentId = '0', page = 0 } = req.query;
        
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 0) {
        return res.status(400).json({ error: 'Invalid page number' });
      }
        const query =  [
            { $match: { parentId, userId } },
            { $skip: pageNumber * 20 },
            {$limit: 20,},
        ];
      const files = await Helper.getFilesWithPagination(query);
      return res.status(200).json(files);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    const users = await Helper.getByToken(req, res);
    if (!users || !users.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = users.user._id.toString();
    const fileId = req.params.id;
    const file = await dbClient.getFile(fileId);
    if (!file || file.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }
    file.isPublic = true;
    await dbClient.updateFile(fileId, { isPublic: false });
      res.status(200).json({ Helper.fileToReturn(file) });
  }

  static async putUnpublish(req, res) {
    const users = await Helper.getByToken(req, res);
    if (!users || !users.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = users.user._id.toString();
    const fileId = req.params.id;
    const file = await dbClient.getFile(fileId);
    if (!file || file.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }

    file.isPublic = false;
    await dbClient.updateFile(fileId, { isPublic: false });
    res.status(200).json({ Helper.fileToReturn(file) });
  }

  static async getFile(req, res) {
    const users = await Helper.getByToken(req, res);
    if (!users || !users.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = users.user._id;
    const fileId = req.params.id;
    const file = await dbClient.getFile(fileId);

    if (!file || file.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }

    if ((file.type === 'folder' || file.type === 'file') && !file.isPublic) {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    let filePath;
    if (file.type === 'folder') {
      filePath = path.join(__dirname, 'files', file.filename);
    } else {
      filePath = file.localPath;
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }
    try {
      const fileBuffer = fs.readFileSync(filePath);

      const extname = path.extname(file.name); // Use file.filename
      const mimeType = mime.lookup(extname) || 'application/octet-stream'; // Default to binary stream if unknown

      res.setHeader('Content-Type', mimeType);
      return res.status(200).send(fileBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
