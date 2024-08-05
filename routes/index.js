import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import Helper from '../controllers/utils';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.delete('/users', UsersController.delUser);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', Helper.authUser, AuthController.getDisconnect);
router.get('/users/me', Helper.authUser, UsersController.getMe);

router.post('/files', Helper.authUser, FilesController.postUpload);
router.get('/files/:id', Helper.authUser, FilesController.getShow);
router.get('/files', Helper.authUser, FilesController.getIndex);

router.put('/files/:id/publish', Helper.authUser, FilesController.putPublish);
router.put('/files/:id/unpublish', Helper.authUser, FilesController.putUnpublish);

router.get('/files/:id/data', FilesController.getFile);

export default router;
