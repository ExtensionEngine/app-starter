
import App, { Router } from 'express';
import { authenticate } from '../auth/middleware';
import { IMiddleware } from '../types/middleware';
import multer from 'multer';
import UserController from './controller';

const upload = multer({ storage: multer.memoryStorage() });

export default createRouter;

function createRouter(
  userController: UserController,
  getUserMiddleware: IMiddleware['handle']
): Router {
  return App.Router()
    .use(authenticate('jwt'))
    .get('/', userController.list)
    .post('/', userController.createOrRestore)
    .param('userId', getUserMiddleware)
    .get('/:userId', userController.get)
    .patch('/:userId', userController.update)
    .delete('/:userId', userController.delete)
    .post('/:userId/invite', userController.invite)
    .post('/import', upload.single('file'), userController.bulkImport)
    .get('/import/template', userController.getImportTemplate);
}
