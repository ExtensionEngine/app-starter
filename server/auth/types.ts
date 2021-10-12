import User from '../user/model';

export type TokenPayload = { id: number };

export type AuthCallback = (
  error: Error | null,
  user: User | string | boolean
) => void;

export type SecretOrKeyCallback = (
  error: Error,
  secretOrKey?: string | Buffer
) => void;
