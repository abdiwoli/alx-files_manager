    static async getShow(req, res) {
        console.log(666666666666666666666666666);
    const users = await Helper.getByToken(req, res);
    if (users && users.user) {
        const fileId = req.params.id;
        const userId = users.user._id;
        const size = req.query.size;
        const validSizes = [500, 250, 100];

        // Validate the size parameter
        if (size && !validSizes.includes(parseInt(size))) {
            return res.status(400).json({ error: 'Invalid size parameter' });
        }

        // Get the file metadata from the database
        const file = await dbClient.getFile(fileId);
        if (file && file.userId === userId.toString()) {
            const fileDir = path.join(__dirname, 'files');
            const originalFilePath = path.join(fileDir, file.localPath);

            // Print debug information
            console.log(`fileDir: ${fileDir}`);
            console.log(`file: ${JSON.stringify(file)}`);
            console.log(`originalFilePath: ${originalFilePath}`);

            if (file.type === 'image' && size && validSizes.includes(parseInt(size))) {
                const resizedFilePath = path.join(fileDir, `${file.localPath}_${size}`);

                // Check if the resized file exists
                if (fs.existsSync(resizedFilePath)) {
                    console.log(`Resized file exists: ${resizedFilePath}`);
                    return res.sendFile(resizedFilePath);
                } else {
                    console.log(`Resized file not found: ${resizedFilePath}`);
                    return res.status(404).json({ error: 'Resized file not found' });
                }
            } else {
                xonsole.log("not public");
                const editedFile = Helper.fileToReturn(file);
                return res.status(200).json(editedFile);
            }
        } else {
            return res.status(404).json({ error: 'Not found' });
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
