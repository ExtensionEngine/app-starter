import User from '../model';

interface IActivityService {
  invite(user: User): Promise<User>;
  resetPassword(user: User): Promise<User>
}

export default IActivityService;
