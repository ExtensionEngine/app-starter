import { AsyncLocalStorage } from 'async_hooks';
import User from '../user/model';

const authContext = new AsyncLocalStorage();

export default { getCurrentUser, runWithUser };

function getCurrentUser(): User {
  return authContext.getStore() as User;
}

function runWithUser(user: User, callback: () => void): void {
  return authContext.run(user, callback);
}
