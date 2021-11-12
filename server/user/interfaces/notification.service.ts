
import User from '../../user/model';

interface IUserNotificationService {
  invite(user: User): Promise<void>;
  resetPassword(user: User): Promise<void>;
}

export default IUserNotificationService;
