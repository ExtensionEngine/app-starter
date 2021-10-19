
import App, { Router } from 'express';
import Authenticate from '../auth/middleware/authenticate';
import { IMiddleware } from '../types/middleware';
import multer from 'multer';
import UserController from './controller';

const upload = multer({ storage: multer.memoryStorage() });

export default createRouter;

function createRouter(
  userController: UserController,
  getUserMiddleware: IMiddleware['handle'],
  authenticate: Authenticate
): Router {
  return App.Router()
    .use(authenticate.handle('jwt'))
    .get('/', userController.list)
    .post('/', userController.createOrRestore)
    .param('userId', getUserMiddleware)
    .get('/:userId', userController.get)
    .patch('/:userId', userController.patch)
    .delete('/:userId', userController.remove)
    .post('/:userId/invite', userController.invite)
    .post('/import', upload.single('file'), userController.bulkImport)
    .get('/import/template', userController.getImportTemplate);
}
