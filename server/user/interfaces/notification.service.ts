
import User from '../../user/model';

interface IAuthService {
  invite(user: User): Promise<User>;
  resetPassword(user: User): Promise<User>;
}

export default IAuthService;
