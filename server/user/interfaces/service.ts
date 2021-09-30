import User from '../model';

interface IUserService {
  invite(user: User): Promise<User>;
  resetPassword(user: User): Promise<User>
}

export default IUserService;
