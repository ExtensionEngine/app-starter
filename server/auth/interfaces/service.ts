import { RequestHandler } from 'express';
import { Audience } from '../audience';
import User from '../../user/model';

interface IAuthService {
  createToken(user: User, audience: Audience, expiresIn: string): string;
  authenticate(user: User, password: string): Promise<boolean | User>;
  setRequestContext(...params: Parameters<RequestHandler>): void;
}

export default IAuthService;
