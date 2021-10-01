import { Audience } from '../audience';
import User from '../../user/model';

interface IAuthService {
  createToken(user: User, audience: Audience, expiresIn: string): string;
  getTokenSecret(user: User, audience?: Audience): string;
  authenticate(user: User, password: string): Promise<boolean | User>;
}

export default IAuthService;
