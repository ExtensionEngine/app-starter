import { ValuesType } from 'utility-types';

const Scope = {
  Access: 'scope:access',
  Setup: 'scope:setup'
} as const;

export type Audience = ValuesType<typeof Scope>;

export default Scope;
