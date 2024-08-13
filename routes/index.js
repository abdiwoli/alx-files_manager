import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import Helper from '../controllers/utils';
import Product from '../controllers/ProductManager';
import { createOrder, capturePayment, formatOrders } from '../utils/services/paypal';
import dotenv from  'dotenv';
import Orders from '../controllers/orderController';

dotenv.config();

const router = Router();

router.get('/', (req, res) => {
  res.send({"status": process.env.BASE_URL, one:"andi"})
})
router.post('/update-file/:id', Product.updateProduct)
router.get('/products', Product.getFiles);
router.get('/owner/:id', Product.isOwner);
router.delete('/delete-product/:id', Product.deleteProduct);

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.delete('/users', UsersController.delUser);
router.get('/collections', FilesController.delete);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', Helper.authUser, AuthController.getDisconnect);
router.get('/users/me', Helper.authUser, UsersController.getMe);

router.post('/files', Helper.authUser, FilesController.postUpload);
router.get('/files/:id', Helper.authUser, FilesController.getShow);
router.get('/files', Helper.authUser, FilesController.getIndex);

router.put('/files/:id/publish', Helper.authUser, FilesController.putPublish);
router.put('/files/:id/unpublish', Helper.authUser, FilesController.putUnpublish);

router.get('/files/:id/data', FilesController.getFile);

router.get('/complete-order', async (req, res) => {
  try{
      await capturePayment(req.query.token);
      res.redirect('http://localhost:3000/orders?status=complete');
  } catch (err) {
      console.log(err);
      res.send({error: err})
  }
});

router.get('/cancel-order', (req, res) => {
  res.redirect('http://localhost:3000')
});

router.post('/pay', async (req, res) => {
  const {orders, userToken} = req.body;
  const user = Helper.userOrder(userToken);
  if (!user){
    return res.redirect('http://localhost:3000/login');
  }
  const parsedOrders = JSON.parse(orders);
  const formated = formatOrders(parsedOrders);  
  console.log(formated)
  try{
      const url = await createOrder(formated, user._id);      
      res.redirect(url);
  } catch (err) {
      res.send({error:err});
  }
})

router.get('/orders', Helper.authUser, Orders.getOrders)
export default router;
