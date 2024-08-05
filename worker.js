import Queue from 'bull';
import dbClient from './utils/db';
import sendMail from './utils/sendmail';
import imageThumbnail from 'image-thumbnail';
import { promises as fsPromises } from 'fs';
import path from 'path';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

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


// you will need to run the file as:
//EMAIL_USER=your_email EMAIL_PASS="emailpassword" npm run dev worker.js
//then email will be sent to created new email from your email
userQueue.process(async (job, done) => {
    const { userId } = job.data;

    if (!userId) {
        return done(new Error("Missing userId"));
    }

    try {
        const user = await dbClient.getUsersById(userId);
        if (!user) {
            return done(new Error("User not found"));
        }

        console.log('Sending email from:', process.env.EMAIL_USER);

        await sendMail(user.email);

        console.log(`Welcome ${user.email}!`);
        done();

    } catch (error) {
        console.error('Error:', error.message);
        done(error);
    }
});

console.log('Job processor is running and ready to process jobs...');
