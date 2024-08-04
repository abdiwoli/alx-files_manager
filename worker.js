import Queue from 'bull';
import dbClient from './utils/db';
import imageThumbnail from 'image-thumbnail';
import { promises as fsPromises } from 'fs';
import path from 'path';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job, done) => {
    const { userId, fileId } = job.data;
    
    if (!fileId) {
        return done(new Error("Missing fileId"));
    }
    if (!userId) {
        return done(new Error("Missing userId"));
    }

    try {
        const file = await dbClient.getFile(fileId);
        if (!file || file.userId !== userId) {
            return done(new Error("File not found"));
        }

        const filePath = file.localPath;
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        const fileExt = path.extname(filePath);
        const widths = [500, 250, 100];
        const options = {};
        await Promise.all(widths.map(async (width) => {
            options.width = width;
            const thumbnail = await imageThumbnail(filePath, options);
            const thumbnailPath = path.join(fileDir, `${fileName}_${width}${fileExt}`);
            await fsPromises.writeFile(thumbnailPath, thumbnail);
            console.log(`Thumbnail created for ${filePath} with width ${width} and saved to ${thumbnailPath}`);
        }));

        done();
    } catch (err) {
        console.error(`Error processing job for fileId ${fileId}:`, err);
        done(err);
    }
});

console.log('Job processor is running and ready to process jobs...');
