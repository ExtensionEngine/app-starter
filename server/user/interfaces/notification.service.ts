
import User from '../../user/model';

interface IUserNotificationService {
  invite(user: User): Promise<User>;
  resetPassword(user: User): Promise<User>;
}

export default IUserNotificationService;
