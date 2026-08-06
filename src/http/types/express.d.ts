import { Role } from '../../domain/enums/Role';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: Role;
      };
    }
  }
}

export {};
