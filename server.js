import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/index';

const app = express();
app.use(express.json());
app.use(router);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
