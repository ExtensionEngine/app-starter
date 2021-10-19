
import App, { Router } from 'express';
import Authenticator from '../auth/middleware/authenticator';
import { IMiddleware } from '../types/middleware';
import multer from 'multer';
import UserController from './controller';

const upload = multer({ storage: multer.memoryStorage() });

export default createRouter;

function createRouter(
  userController: UserController,
  getUserMiddleware: IMiddleware['handle'],
  authenticator: Authenticator
): Router {
  return App.Router()
    .use(authenticator.authenticate('jwt'))
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
